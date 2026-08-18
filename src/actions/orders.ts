"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { initCinetPayPayment, isCinetPayConfigured } from "@/lib/cinetpay";
import { isCinetPayAmount } from "@/lib/events";
import { isValidBuyerPhone, toCinetPayPhone } from "@/lib/phone";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber, generateTransactionId } from "@/lib/ticket-codes";
import {
  applyCinetPayCheck,
  expireExpiredReservations,
  fulfillPaidOrder,
  markAwaitingPayment,
  releaseOrder,
  reserveOrder,
  validateCart,
} from "@/lib/ticket-orders";
import { absoluteUrl } from "@/lib/utils";

export type OrderActionState = {
  ok: boolean;
  message: string;
  redirectTo?: string;
  fieldErrors?: Record<string, string[]>;
};

const qtyKey = /^qty_([a-z0-9]+)$/i;

function parseLines(formData: FormData) {
  const lines: { ticketTypeId: string; quantity: number }[] = [];
  for (const [key, value] of formData.entries()) {
    const match = qtyKey.exec(key);
    if (!match) continue;
    const quantity = Number.parseInt(String(value || "0"), 10);
    if (Number.isFinite(quantity) && quantity > 0) {
      lines.push({ ticketTypeId: match[1], quantity });
    }
  }
  return lines;
}

export async function createTicketOrder(
  _prev: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return { ok: false, message: "Connectez-vous pour acheter un billet." };
  }

  const parsed = z
    .object({
      eventId: z.string().min(1),
      phone: z.string().min(8, "Indiquez un numéro Mobile Money."),
    })
    .safeParse({
      eventId: String(formData.get("eventId") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
    });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Veuillez corriger le formulaire.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  if (!isValidBuyerPhone(parsed.data.phone)) {
    return {
      ok: false,
      message: "Numéro de téléphone invalide.",
      fieldErrors: { phone: ["Indiquez un numéro valide (9 à 15 chiffres)."] },
    };
  }

  await expireExpiredReservations(20);

  const lines = parseLines(formData);
  const cart = await validateCart(parsed.data.eventId, lines, session.user.id);
  if (!cart.ok) return { ok: false, message: cart.message };

  if (cart.amount > 0 && !isCinetPayAmount(cart.amount)) {
    return { ok: false, message: "Le montant n’est pas compatible avec CinetPay (multiple de 5)." };
  }
  if (cart.amount > 0 && !isCinetPayConfigured()) {
    return { ok: false, message: "Le paiement en ligne n’est pas encore configuré." };
  }

  const buyerPhone = toCinetPayPhone(parsed.data.phone);
  let order;
  try {
    order = await reserveOrder({
      eventId: parsed.data.eventId,
      userId: session.user.id,
      buyerName: session.user.name || "Client",
      buyerEmail: session.user.email,
      buyerPhone,
      orderNumber: generateOrderNumber(),
      transactionId: generateTransactionId(),
      items: cart.items,
      amount: cart.amount,
      currency: cart.currency,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "STOCK") {
      return { ok: false, message: "Ces places viennent d’être prises. Réessayez avec un autre tarif." };
    }
    console.error("[tickets] reserve", error);
    return { ok: false, message: "Impossible de réserver ces places. Réessayez." };
  }

  if (cart.amount === 0) {
    await fulfillPaidOrder(order.id);
    redirect(`/paiement/${order.id}/confirmation`);
  }

  const payment = order.payment;
  if (!payment) {
    await releaseOrder(order.id, "FAILED");
    return { ok: false, message: "Paiement introuvable après réservation." };
  }

  const init = await initCinetPayPayment({
    transactionId: payment.transactionId,
    amount: order.amount,
    currency: order.currency,
    description: `Billets ${cart.event.title}`,
    notifyUrl: absoluteUrl("/api/payments/cinetpay/notify"),
    returnUrl: absoluteUrl(`/paiement/${order.id}/retour`),
    customerName: order.buyerName,
    customerEmail: order.buyerEmail,
    customerPhone: buyerPhone,
    metadata: order.id,
  });

  if (!init.ok) {
    await releaseOrder(order.id, "FAILED");
    return { ok: false, message: init.message };
  }

  await markAwaitingPayment(order.id, init.paymentUrl, init.paymentToken);
  redirect(init.paymentUrl);
}

export async function refreshTicketPayment(
  _prev: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  const orderId = String(formData.get("orderId") || "").trim();
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/connexion?callbackUrl=/paiement/${orderId}`);
  }

  const order = await prisma.ticketOrder.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });
  if (!order || order.userId !== session.user.id) {
    return { ok: false, message: "Commande introuvable." };
  }
  if (order.status === "PAID") {
    redirect(`/paiement/${order.id}/confirmation`);
  }
  if (order.payment) {
    const result = await applyCinetPayCheck(order.payment.transactionId, "CHECK");
    if (result.ok) redirect(`/paiement/${order.id}/confirmation`);
  }
  return { ok: false, message: "Paiement pas encore confirmé par CinetPay." };
}
