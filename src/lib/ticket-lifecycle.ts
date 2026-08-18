import type { Prisma } from "@prisma/client";
import { snapshotEvent, writeEventAudit } from "@/lib/event-audit";
import { prisma } from "@/lib/prisma";
import { cancelEventError, refundOrderError, restockByTicketType } from "@/lib/ticket-refunds";
import { lockEvent, releaseType } from "@/lib/ticket-orders";
import { totalRemaining } from "@/lib/events";

type Tx = Prisma.TransactionClient;

async function restockSold(tx: Tx, ticketTypeId: string, quantity: number) {
  if (quantity <= 0) return;
  await tx.$executeRaw`
    UPDATE "TicketType"
    SET "soldCount" = GREATEST("soldCount" - ${quantity}, 0), "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = ${ticketTypeId}
  `;
}

export async function applyEventCancellation(
  tx: Tx,
  eventId: string,
  actorId: string | null
) {
  const event = await tx.event.findUnique({
    where: { id: eventId },
    include: {
      ticketTypes: {
        select: { name: true, quantity: true, soldCount: true, reservedCount: true, price: true },
      },
    },
  });
  if (!event) throw new Error("Événement introuvable.");
  const already = cancelEventError(event.status);
  if (already) return { already: true as const, event };

  await lockEvent(tx, eventId);

  const holds = await tx.ticketOrder.findMany({
    where: { eventId, status: { in: ["PENDING", "AWAITING_PAYMENT"] } },
    include: { items: true, payment: true },
  });
  for (const order of holds) {
    for (const item of order.items) {
      await releaseType(tx, item.ticketTypeId, item.quantity);
    }
    await tx.ticketOrder.update({
      where: { id: order.id },
      data: { status: "CANCELLED", reservedUntil: null },
    });
    if (order.payment && order.payment.status === "INITIATED") {
      await tx.payment.update({
        where: { id: order.payment.id },
        data: { status: "CANCELLED" },
      });
    }
  }

  const cancelledTickets = await tx.ticket.updateMany({
    where: { eventId, status: "VALID" },
    data: { status: "CANCELLED" },
  });

  const updated = await tx.event.update({
    where: { id: eventId },
    data: { status: "CANCELLED" },
  });

  await writeEventAudit(tx, {
    eventId,
    actorId,
    action: "EVENT_CANCELLED",
    summary: `Événement annulé · ${cancelledTickets.count} billet(s) invalidé(s) · ${holds.length} commande(s) en attente libérée(s).`,
    beforeJson: snapshotEvent(event),
    afterJson: snapshotEvent({ ...updated, ticketTypes: event.ticketTypes }),
  });

  return { already: false as const, event: updated, cancelledTickets: cancelledTickets.count, releasedHolds: holds.length };
}

export async function cancelEvent(eventId: string, actorId: string) {
  return prisma.$transaction(async (tx) => applyEventCancellation(tx, eventId, actorId));
}

export async function refundPaidOrder(params: {
  orderId: string;
  actorId: string;
  reason: string;
  restock: boolean;
}) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.ticketOrder.findUnique({
      where: { id: params.orderId },
      include: {
        refund: true,
        tickets: { select: { id: true, ticketTypeId: true, status: true } },
        event: {
          include: {
            ticketTypes: {
              select: { id: true, name: true, quantity: true, soldCount: true, reservedCount: true, price: true },
            },
          },
        },
      },
    });
    if (!order) throw new Error("Commande introuvable.");

    const error = refundOrderError({
      orderStatus: order.status,
      alreadyRefunded: Boolean(order.refund),
      amount: order.amount,
      reason: params.reason,
    });
    if (error) throw new Error(error);

    await lockEvent(tx, order.eventId);

    const restockMap = params.restock ? restockByTicketType(order.tickets) : new Map<string, number>();
    let restocked = 0;
    for (const [ticketTypeId, quantity] of restockMap) {
      await restockSold(tx, ticketTypeId, quantity);
      restocked += quantity;
    }

    await tx.ticket.updateMany({
      where: { orderId: order.id, status: { in: ["VALID", "CANCELLED", "USED"] } },
      data: { status: "REFUNDED" },
    });

    await tx.ticketOrder.update({
      where: { id: order.id },
      data: { status: "REFUNDED", reservedUntil: null },
    });

    const refund = await tx.refund.create({
      data: {
        orderId: order.id,
        eventId: order.eventId,
        actorId: params.actorId,
        amount: order.amount,
        currency: order.currency,
        reason: params.reason.trim().slice(0, 400),
        restock: params.restock,
        ticketCount: order.tickets.length,
      },
    });

    if (params.restock && order.event.status === "SOLD_OUT") {
      const types = await tx.ticketType.findMany({
        where: { eventId: order.eventId },
        select: { quantity: true, soldCount: true, reservedCount: true },
      });
      if (totalRemaining(types) > 0) {
        await tx.event.update({ where: { id: order.eventId }, data: { status: "PUBLISHED" } });
      }
    }

    await writeEventAudit(tx, {
      eventId: order.eventId,
      actorId: params.actorId,
      action: "ORDER_REFUNDED",
      summary: `Commande ${order.orderNumber} remboursée · ${order.amount} ${order.currency}${
        params.restock ? ` · ${restocked} place(s) restockée(s)` : " · sans restock"
      }.`,
      beforeJson: snapshotEvent(order.event),
      afterJson: JSON.stringify({
        orderId: order.id,
        orderNumber: order.orderNumber,
        restock: params.restock,
        restocked,
        reason: params.reason.trim().slice(0, 400),
      }),
    });

    return { refund, restocked };
  });
}
