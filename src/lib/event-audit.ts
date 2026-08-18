import type { Prisma } from "@prisma/client";

type Tx = Prisma.TransactionClient;

export const AUDIT_ACTIONS = [
  "EVENT_CREATED",
  "EVENT_UPDATED",
  "STATUS_CHANGED",
  "EVENT_CANCELLED",
  "ORDER_REFUNDED",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export function auditActionLabel(action: string) {
  const map: Record<string, string> = {
    EVENT_CREATED: "Création",
    EVENT_UPDATED: "Modification",
    STATUS_CHANGED: "Changement de statut",
    EVENT_CANCELLED: "Annulation",
    ORDER_REFUNDED: "Remboursement",
  };
  return map[action] || action;
}

export function snapshotEvent(event: {
  status: string;
  capacity: number;
  title?: string;
  ticketTypes?: { name: string; quantity: number; soldCount: number; reservedCount: number; price: number }[];
}) {
  return JSON.stringify({
    title: event.title,
    status: event.status,
    capacity: event.capacity,
    ticketTypes: (event.ticketTypes || []).map((type) => ({
      name: type.name,
      quantity: type.quantity,
      soldCount: type.soldCount,
      reservedCount: type.reservedCount,
      price: type.price,
    })),
  });
}

export async function writeEventAudit(
  tx: Tx,
  params: {
    eventId: string;
    actorId?: string | null;
    action: AuditAction;
    summary: string;
    beforeJson?: string;
    afterJson?: string;
  }
) {
  await tx.eventAuditLog.create({
    data: {
      eventId: params.eventId,
      actorId: params.actorId || null,
      action: params.action,
      summary: params.summary.slice(0, 400),
      beforeJson: params.beforeJson || "",
      afterJson: params.afterJson || "",
    },
  });
}
