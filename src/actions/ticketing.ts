"use server";

import { revalidatePath } from "next/cache";
import { formBool, formString, requireAdmin, type AdminActionState } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { canManageEventDashboard } from "@/lib/organizer";
import { prisma } from "@/lib/prisma";
import { cancelEvent, refundPaidOrder } from "@/lib/ticket-lifecycle";

function revalidateTicketing(eventId: string, slug?: string | null) {
  revalidatePath("/admin/evenements");
  revalidatePath(`/admin/evenements/${eventId}`);
  revalidatePath(`/organisateur/evenements/${eventId}`);
  revalidatePath("/organisateur");
  revalidatePath("/compte/billets");
  if (slug) revalidatePath(`/evenements/${slug}`);
}

export async function refundPaidOrderAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Connectez-vous pour rembourser." };
  }

  const orderId = formString(formData, "orderId");
  const reason = formString(formData, "reason");
  const restock = formBool(formData, "restock");
  if (!orderId) return { ok: false, message: "Commande manquante." };

  const order = await prisma.ticketOrder.findUnique({
    where: { id: orderId },
    select: { eventId: true, event: { select: { slug: true } } },
  });
  if (!order) return { ok: false, message: "Commande introuvable." };

  if (!(await canManageEventDashboard(session.user.id, session.user.role, order.eventId))) {
    return { ok: false, message: "Vous n’avez pas le droit de rembourser cette commande." };
  }

  try {
    await refundPaidOrder({
      orderId,
      actorId: session.user.id,
      reason,
      restock,
    });
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Impossible de marquer le remboursement.",
    };
  }

  revalidateTicketing(order.eventId, order.event.slug);
  return {
    ok: true,
    message: restock
      ? "Remboursement enregistré. Les places non utilisées sont revenues au stock."
      : "Remboursement enregistré. Le stock n’a pas été modifié.",
  };
}

export async function cancelEventAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const session = await requireAdmin();
  const eventId = formString(formData, "eventId");
  if (!eventId) return { ok: false, message: "Événement manquant." };

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { slug: true, status: true },
  });
  if (!event) return { ok: false, message: "Événement introuvable." };

  try {
    await cancelEvent(eventId, session.user.id);
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Impossible d’annuler l’événement.",
    };
  }

  revalidateTicketing(eventId, event.slug);
  return {
    ok: true,
    message: "Événement annulé. Les billets non utilisés ne passent plus au scan. Remboursez ensuite chaque commande payée.",
  };
}
