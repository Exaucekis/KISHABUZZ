import { classifyTicketScan, scanResultLabel, type ScanOutcome, type ScanResultCode } from "@/lib/ticket-scan-core";
import { isPublicCode } from "@/lib/ticket-codes";
import { parseTicketQrPayload, verifyTicketSignature } from "@/lib/ticket-qr";
import { canAccessAdmin } from "@/lib/roles";
import { prisma } from "@/lib/prisma";

export type { ScanOutcome, ScanResultCode } from "@/lib/ticket-scan-core";
export { scanResultLabel, classifyTicketScan } from "@/lib/ticket-scan-core";

export async function listScannableEvents(userId: string, role: string | null | undefined) {
  if (canAccessAdmin(role)) {
    return prisma.event.findMany({
      where: { status: { in: ["PUBLISHED", "SOLD_OUT", "ENDED"] } },
      select: { id: true, title: true, startsAt: true, venueName: true, city: true },
      orderBy: { startsAt: "desc" },
      take: 80,
    });
  }

  return prisma.event.findMany({
    where: {
      staff: { some: { userId } },
      status: { in: ["PUBLISHED", "SOLD_OUT", "ENDED"] },
    },
    select: { id: true, title: true, startsAt: true, venueName: true, city: true },
    orderBy: { startsAt: "desc" },
  });
}

export async function canScanEvent(userId: string, role: string | null | undefined, eventId: string) {
  if (canAccessAdmin(role)) return true;
  const staff = await prisma.eventStaff.findUnique({
    where: { eventId_userId: { eventId, userId } },
    select: { userId: true },
  });
  return Boolean(staff);
}

export async function canAccessScan(userId: string, role: string | null | undefined) {
  if (canAccessAdmin(role)) return true;
  const count = await prisma.eventStaff.count({ where: { userId } });
  return count > 0;
}

export async function scanTicketAtEvent(params: {
  rawPayload: string;
  eventId: string;
  staffUserId: string;
  staffRole?: string | null;
  deviceNote?: string;
}): Promise<ScanOutcome> {
  if (!params.eventId) {
    return { result: "INVALID", message: "Choisissez un événement.", ticket: null };
  }
  const allowed = await canScanEvent(params.staffUserId, params.staffRole, params.eventId);
  if (!allowed) {
    return { result: "INVALID", message: "Vous n’êtes pas autorisé à contrôler cet événement.", ticket: null };
  }

  const parsed = parseTicketQrPayload(params.rawPayload);
  const publicCode = parsed.publicCode.trim().toUpperCase();
  const signatureOk =
    parsed.signature && parsed.signature.length > 0
      ? verifyTicketSignature(publicCode, parsed.signature)
      : null;

  if (!isPublicCode(publicCode) || signatureOk === false) {
    return { result: "INVALID", message: scanResultLabel("INVALID"), ticket: null };
  }

  const ticket = await prisma.ticket.findUnique({
    where: { publicCode },
    include: {
      order: { select: { status: true } },
      event: { select: { title: true } },
      ticketType: { select: { name: true } },
    },
  });

  const classified = classifyTicketScan({
    ticket: ticket
      ? { eventId: ticket.eventId, status: ticket.status, orderStatus: ticket.order.status }
      : null,
    eventId: params.eventId,
    signatureOk,
  });

  if (!ticket || classified !== "OK") {
    if (ticket) {
      await prisma.ticketScan.create({
        data: {
          ticketId: ticket.id,
          eventId: params.eventId,
          staffUserId: params.staffUserId,
          result: classified,
          deviceNote: (params.deviceNote || "").slice(0, 180),
        },
      });
    }
    return {
      result: classified,
      message: scanResultLabel(classified),
      ticket: ticket
        ? {
            publicCode: ticket.publicCode,
            holderName: ticket.holderName,
            ticketType: ticket.ticketType.name,
            eventTitle: ticket.event.title,
            status: ticket.status,
          }
        : null,
    };
  }

  const updated = await prisma.ticket.updateMany({
    where: { id: ticket.id, status: "VALID" },
    data: {
      status: "USED",
      usedAt: new Date(),
      usedByStaffId: params.staffUserId,
    },
  });

  const result: ScanResultCode = updated.count === 1 ? "OK" : "ALREADY_USED";
  await prisma.ticketScan.create({
    data: {
      ticketId: ticket.id,
      eventId: params.eventId,
      staffUserId: params.staffUserId,
      result,
      deviceNote: (params.deviceNote || "").slice(0, 180),
    },
  });

  return {
    result,
    message: scanResultLabel(result),
    ticket: {
      publicCode: ticket.publicCode,
      holderName: ticket.holderName,
      ticketType: ticket.ticketType.name,
      eventTitle: ticket.event.title,
      status: result === "OK" ? "USED" : ticket.status,
    },
  };
}
