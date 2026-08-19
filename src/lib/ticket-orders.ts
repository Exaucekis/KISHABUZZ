import { Prisma } from "@prisma/client";
import {
  amountsMatch,
  checkCinetPayPayment,
  mapCinetPayStatus,
  mergePaymentJson,
  paymentUrlFromRaw,
  safeJson,
} from "@/lib/cinetpay";
import { eventOnSale, remainingSeats, RESERVATION_MINUTES, ticketTypeOnSale, totalRemaining } from "@/lib/events";
import { ticketTypeHasLiveDay } from "@/lib/event-schedule";
import { prisma } from "@/lib/prisma";
import { createTicketSecret, generatePublicCode } from "@/lib/ticket-codes";
import { sendOrderPaidEmail } from "@/lib/ticket-mail";

export { RESERVATION_MINUTES };
export function reservationDeadline(now = new Date(), minutes = RESERVATION_MINUTES) {
  return new Date(now.getTime() + minutes * 60 * 1000);
}

type Tx = Prisma.TransactionClient;

type CartLine = { ticketTypeId: string; quantity: number };

export async function lockEvent(tx: Tx, eventId: string) {
  await tx.$queryRaw`SELECT id FROM "Event" WHERE id = ${eventId} FOR UPDATE`;
}

async function reserveType(tx: Tx, ticketTypeId: string, quantity: number) {
  const count = await tx.$executeRaw`
    UPDATE "TicketType"
    SET "reservedCount" = "reservedCount" + ${quantity}, "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = ${ticketTypeId}
      AND "visible" = true
      AND "quantity" - "soldCount" - "reservedCount" >= ${quantity}
  `;
  return count === 1;
}

export async function releaseType(tx: Tx, ticketTypeId: string, quantity: number) {
  await tx.$executeRaw`
    UPDATE "TicketType"
    SET "reservedCount" = GREATEST("reservedCount" - ${quantity}, 0), "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = ${ticketTypeId}
  `;
}

async function convertReservedToSold(tx: Tx, ticketTypeId: string, quantity: number) {
  const converted = await tx.$executeRaw`
    UPDATE "TicketType"
    SET
      "reservedCount" = "reservedCount" - ${quantity},
      "soldCount" = "soldCount" + ${quantity},
      "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = ${ticketTypeId}
      AND "reservedCount" >= ${quantity}
  `;
  if (converted === 1) return "reserved";

  const fromStock = await tx.$executeRaw`
    UPDATE "TicketType"
    SET "soldCount" = "soldCount" + ${quantity}, "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = ${ticketTypeId}
      AND "quantity" - "soldCount" - "reservedCount" >= ${quantity}
  `;
  if (fromStock === 1) return "stock";

  return "failed";
}

class StockShortageError extends Error {
  constructor() {
    super("STOCK_SHORTAGE");
    this.name = "StockShortageError";
  }
}

export async function validateCart(eventId: string, lines: CartLine[], userId: string, now = new Date()) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { ticketTypes: { include: { sessions: true } }, sessions: true },
  });
  if (!event) return { ok: false as const, message: "Événement introuvable." };
  if (!eventOnSale(event, now)) {
    return { ok: false as const, message: "La billetterie n’est pas ouverte pour cet événement." };
  }

  const wanted = lines.filter((line) => line.quantity > 0);
  if (!wanted.length) return { ok: false as const, message: "Choisissez au moins un billet." };

  const typesById = new Map(event.ticketTypes.map((type) => [type.id, type]));
  const items: {
    ticketTypeId: string;
    quantity: number;
    unitPrice: number;
    name: string;
  }[] = [];

  for (const line of wanted) {
    const type = typesById.get(line.ticketTypeId);
    if (!type || !ticketTypeOnSale(type, now)) {
      return { ok: false as const, message: "Un tarif n’est plus disponible." };
    }
    if (
      !ticketTypeHasLiveDay(
        event.sessions,
        type.sessions.map((row) => row.sessionId),
        now
      )
    ) {
      return { ok: false as const, message: `« ${type.name} » n’est plus valable : les jours concernés sont passés.` };
    }
    if (line.quantity > type.maxPerOrder) {
      return { ok: false as const, message: `Maximum ${type.maxPerOrder} billet(s) « ${type.name} » par commande.` };
    }
    if (line.quantity > remainingSeats(type)) {
      return { ok: false as const, message: `Plus assez de places pour « ${type.name} ».` };
    }

    const already = await prisma.orderItem.aggregate({
      where: {
        ticketTypeId: type.id,
        order: { userId, eventId, status: { in: ["PENDING", "AWAITING_PAYMENT", "PAID"] } },
      },
      _sum: { quantity: true },
    });
    const held = already._sum.quantity || 0;
    if (held + line.quantity > type.maxPerOrder) {
      return {
        ok: false as const,
        message: `Vous avez déjà ${held} billet(s) « ${type.name} » (max. ${type.maxPerOrder}).`,
      };
    }

    items.push({
      ticketTypeId: type.id,
      quantity: line.quantity,
      unitPrice: type.price,
      name: type.name,
    });
  }

  const adding = items.reduce((sum, item) => sum + item.quantity, 0);
  if (event.capacity > 0) {
    const used = event.ticketTypes.reduce((sum, type) => sum + type.soldCount + type.reservedCount, 0);
    if (used + adding > event.capacity) {
      return { ok: false as const, message: "La capacité globale de l’événement est atteinte." };
    }
  }

  const amount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  return {
    ok: true as const,
    event,
    items,
    amount,
    currency: event.currency,
  };
}

export async function reserveOrder(params: {
  eventId: string;
  userId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  orderNumber: string;
  transactionId: string;
  items: { ticketTypeId: string; quantity: number; unitPrice: number }[];
  amount: number;
  currency: string;
}) {
  return prisma.$transaction(async (tx) => {
    await lockEvent(tx, params.eventId);

    for (const item of params.items) {
      const ok = await reserveType(tx, item.ticketTypeId, item.quantity);
      if (!ok) {
        throw new Error("STOCK");
      }
    }

    const order = await tx.ticketOrder.create({
      data: {
        orderNumber: params.orderNumber,
        userId: params.userId,
        eventId: params.eventId,
        buyerName: params.buyerName,
        buyerEmail: params.buyerEmail,
        buyerPhone: params.buyerPhone,
        status: "PENDING",
        reservedUntil: reservationDeadline(),
        amount: params.amount,
        currency: params.currency,
        items: {
          create: params.items.map((item) => ({
            ticketTypeId: item.ticketTypeId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
        payment: {
          create: {
            transactionId: params.transactionId,
            status: "INITIATED",
            amount: params.amount,
            currency: params.currency,
          },
        },
      },
      include: { items: true, payment: true, event: true },
    });

    if (params.buyerPhone) {
      await tx.user.update({
        where: { id: params.userId },
        data: { phone: params.buyerPhone },
      });
    }

    return order;
  });
}

async function createTicketsForOrder(tx: Tx, order: { id: string; eventId: string; userId: string; buyerName: string; items: { ticketTypeId: string; quantity: number }[] }) {
  const existing = await tx.ticket.count({ where: { orderId: order.id } });
  if (existing > 0) return;

  const rows: {
    orderId: string;
    ticketTypeId: string;
    eventId: string;
    userId: string;
    publicCode: string;
    secretHash: string;
    holderName: string;
  }[] = [];

  for (const item of order.items) {
    for (let i = 0; i < item.quantity; i += 1) {
      rows.push({
        orderId: order.id,
        ticketTypeId: item.ticketTypeId,
        eventId: order.eventId,
        userId: order.userId,
        publicCode: generatePublicCode(),
        secretHash: createTicketSecret().secretHash,
        holderName: order.buyerName,
      });
    }
  }

  if (rows.length) {
    await tx.ticket.createMany({ data: rows });
  }
}

async function maybeMarkSoldOut(tx: Tx, eventId: string) {
  const event = await tx.event.findUnique({
    where: { id: eventId },
    include: { ticketTypes: { select: { quantity: true, soldCount: true, reservedCount: true } } },
  });
  if (!event || event.status !== "PUBLISHED") return;
  const left = totalRemaining(event.ticketTypes);
  const capacityLeft =
    event.capacity > 0
      ? Math.max(0, event.capacity - event.ticketTypes.reduce((sum, type) => sum + type.soldCount, 0))
      : left;
  if (left === 0 || capacityLeft === 0) {
    await tx.event.update({ where: { id: eventId }, data: { status: "SOLD_OUT" } });
  }
}

export async function fulfillPaidOrder(orderId: string) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.ticketOrder.findUnique({
        where: { id: orderId },
        include: { items: true, payment: true },
      });
      if (!order) return { created: false, alreadyPaid: false, needsReview: false };
      if (order.status === "PAID") {
        await createTicketsForOrder(tx, order);
        return { created: false, alreadyPaid: true, needsReview: false };
      }

      for (const item of order.items) {
        const converted = await convertReservedToSold(tx, item.ticketTypeId, item.quantity);
        if (converted === "failed") throw new StockShortageError();
      }

      await tx.ticketOrder.update({
        where: { id: order.id },
        data: { status: "PAID", reservedUntil: null },
      });
      if (order.payment) {
        await tx.payment.update({
          where: { id: order.payment.id },
          data: { status: "ACCEPTED", checkedAt: new Date() },
        });
      }
      await createTicketsForOrder(tx, order);
      await maybeMarkSoldOut(tx, order.eventId);
      return { created: true, alreadyPaid: false, needsReview: false };
    });

    if (result.created) {
      try {
        await sendOrderPaidEmail(orderId);
      } catch (error) {
        console.error("[tickets] email", error);
      }
    }

    return result;
  } catch (error) {
    if (error instanceof StockShortageError || (error instanceof Error && error.message === "STOCK_SHORTAGE")) {
      const payment = await prisma.payment.findUnique({ where: { orderId } });
      if (payment) {
        await prisma.paymentEvent.create({
          data: {
            paymentId: payment.id,
            kind: "STOCK_SHORTAGE",
            payload: JSON.stringify({ orderId, at: new Date().toISOString() }),
          },
        });
      }
      return { created: false, alreadyPaid: false, needsReview: true };
    }
    throw error;
  }
}

export async function releaseOrder(orderId: string, status: "FAILED" | "EXPIRED" | "CANCELLED") {
  await prisma.$transaction(async (tx) => {
    const order = await tx.ticketOrder.findUnique({
      where: { id: orderId },
      include: { items: true, payment: true },
    });
    if (!order) return;
    if (order.status === "PAID" || order.status === "REFUNDED") return;
    if (order.status === "FAILED" || order.status === "EXPIRED" || order.status === "CANCELLED") return;

    for (const item of order.items) {
      await releaseType(tx, item.ticketTypeId, item.quantity);
    }

    await tx.ticketOrder.update({
      where: { id: order.id },
      data: { status, reservedUntil: null },
    });
    if (order.payment && order.payment.status === "INITIATED") {
      await tx.payment.update({
        where: { id: order.payment.id },
        data: { status: status === "EXPIRED" ? "EXPIRED" : status === "CANCELLED" ? "CANCELLED" : "REFUSED" },
      });
    }
  });
}

export async function applyCinetPayCheck(transactionId: string, kind: "NOTIFY" | "CHECK" | "RETURN") {
  const payment = await prisma.payment.findUnique({
    where: { transactionId },
    include: { order: true },
  });
  if (!payment) return { ok: false as const, reason: "unknown" as const, orderId: "" };

  const check = await checkCinetPayPayment(transactionId);
  const paymentStatus = mapCinetPayStatus(check.status);
  const accepted = paymentStatus === "ACCEPTED" && amountsMatch(payment.order, check);
  const nextStatus =
    payment.order.status === "PAID" || accepted
      ? "ACCEPTED"
      : paymentStatus === "PENDING" || paymentStatus === "ACCEPTED"
        ? payment.status
        : paymentStatus;

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      paymentMethod: check.paymentMethod || payment.paymentMethod,
      rawCheckJson: mergePaymentJson(payment.rawCheckJson, {
        lastCheck: {
          status: check.status,
          amount: check.amount,
          currency: check.currency,
          paymentMethod: check.paymentMethod,
          message: check.message,
        },
      }),
      checkedAt: new Date(),
      status: nextStatus,
    },
  });
  await prisma.paymentEvent.create({
    data: {
      paymentId: payment.id,
      kind,
      payload: safeJson({ transactionId, status: check.status, amount: check.amount, currency: check.currency }),
    },
  });

  if (paymentStatus === "ACCEPTED") {
    if (!amountsMatch(payment.order, check)) {
      await prisma.paymentEvent.create({
        data: {
          paymentId: payment.id,
          kind: "CHECK",
          payload: safeJson({ error: "amount_mismatch", expected: payment.order.amount, got: check.amount }),
        },
      });
      return { ok: false as const, reason: "amount" as const, orderId: payment.orderId };
    }
    await fulfillPaidOrder(payment.orderId);
    return { ok: true as const, reason: "paid" as const, orderId: payment.orderId };
  }

  if (check.status === "REFUSED" || check.status === "CANCELLED" || check.status === "EXPIRED") {
    await releaseOrder(payment.orderId, check.status === "EXPIRED" ? "EXPIRED" : check.status === "CANCELLED" ? "CANCELLED" : "FAILED");
    return { ok: false as const, reason: check.status.toLowerCase() as "refused" | "cancelled" | "expired", orderId: payment.orderId };
  }

  return { ok: false as const, reason: "pending" as const, orderId: payment.orderId };
}

export async function expireExpiredReservations(limit = 40) {
  const due = await prisma.ticketOrder.findMany({
    where: {
      status: { in: ["PENDING", "AWAITING_PAYMENT"] },
      reservedUntil: { lt: new Date() },
    },
    include: { payment: true },
    take: limit,
    orderBy: { reservedUntil: "asc" },
  });

  let expired = 0;
  let recovered = 0;

  for (const order of due) {
    if (order.payment?.transactionId) {
      const result = await applyCinetPayCheck(order.payment.transactionId, "CHECK");
      if (result.ok) {
        recovered += 1;
        continue;
      }
      if (result.reason === "pending") {
        await releaseOrder(order.id, "EXPIRED");
        expired += 1;
        continue;
      }
      expired += 1;
      continue;
    }
    await releaseOrder(order.id, "EXPIRED");
    expired += 1;
  }

  return { expired, recovered, scanned: due.length };
}

export async function markAwaitingPayment(orderId: string, paymentUrl: string, paymentToken: string) {
  const order = await prisma.ticketOrder.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });
  if (!order?.payment) return;

  await prisma.payment.update({
    where: { id: order.payment.id },
    data: {
      providerToken: paymentToken,
      rawCheckJson: mergePaymentJson(order.payment.rawCheckJson, { payment_url: paymentUrl, payment_token: paymentToken }),
    },
  });
  await prisma.ticketOrder.update({
    where: { id: orderId },
    data: { status: "AWAITING_PAYMENT" },
  });
}

export function storedPaymentUrl(rawCheckJson: string) {
  return paymentUrlFromRaw(rawCheckJson);
}
