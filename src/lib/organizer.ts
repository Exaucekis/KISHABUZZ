import { asRole } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { summarizeOrganizerEvent } from "@/lib/organizer-stats";

export async function listEventOrganizerOptions(currentId?: string | null) {
  return prisma.user.findMany({
    where: {
      OR: [
        { role: { in: ["SUPERADMIN", "ADMIN", "EDITOR", "AUTHOR"] } },
        ...(currentId ? [{ id: currentId }] : []),
        { organizedEvents: { some: {} } },
      ],
    },
    select: { id: true, name: true, email: true, role: true },
    orderBy: [{ name: "asc" }, { email: "asc" }],
    take: 200,
  });
}

export function canAccessAllOrganizerEvents(role: string | null | undefined) {
  const value = asRole(role);
  return value === "SUPERADMIN" || value === "ADMIN";
}

export async function canAccessOrganizerHome(userId: string, role: string | null | undefined) {
  if (canAccessAllOrganizerEvents(role)) return true;
  const [managed, organized] = await Promise.all([
    prisma.eventStaff.count({ where: { userId, role: "MANAGER" } }),
    prisma.event.count({ where: { organizerId: userId } }),
  ]);
  return managed > 0 || organized > 0;
}

export async function canManageEventDashboard(userId: string, role: string | null | undefined, eventId: string) {
  if (canAccessAllOrganizerEvents(role)) return true;
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { organizerId: true },
  });
  if (!event) return false;
  if (event.organizerId === userId) return true;
  const staff = await prisma.eventStaff.findUnique({
    where: { eventId_userId: { eventId, userId } },
    select: { role: true },
  });
  return staff?.role === "MANAGER";
}

export async function listManagedEvents(userId: string, role: string | null | undefined) {
  if (canAccessAllOrganizerEvents(role)) {
    return prisma.event.findMany({
      include: {
        ticketTypes: { select: { quantity: true, soldCount: true, reservedCount: true, price: true } },
        orders: { where: { status: "PAID" }, select: { amount: true } },
      },
      orderBy: { startsAt: "desc" },
      take: 80,
    });
  }

  return prisma.event.findMany({
    where: {
      OR: [{ organizerId: userId }, { staff: { some: { userId, role: "MANAGER" } } }],
    },
    include: {
      ticketTypes: { select: { quantity: true, soldCount: true, reservedCount: true, price: true } },
      orders: { where: { status: "PAID" }, select: { amount: true } },
    },
    orderBy: { startsAt: "desc" },
  });
}

export async function getEventDashboard(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      category: { select: { name: true } },
      ticketTypes: { orderBy: { sortOrder: "asc" } },
      orders: {
        where: { status: { in: ["PAID", "AWAITING_PAYMENT", "PENDING", "REFUNDED"] } },
        include: {
          items: true,
          payment: { select: { status: true, paymentMethod: true, transactionId: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 120,
      },
      tickets: {
        include: { ticketType: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 200,
      },
      scans: {
        include: {
          ticket: { select: { publicCode: true, holderName: true } },
          staff: { select: { name: true } },
        },
        orderBy: { scannedAt: "desc" },
        take: 40,
      },
    },
  });
  if (!event) return null;

  const scannedCount = await prisma.ticket.count({ where: { eventId: event.id, status: "USED" } });
  const paidOrders = event.orders.filter((order) => order.status === "PAID");
  const refundedOrders = event.orders.filter((order) => order.status === "REFUNDED");
  const paidItems = paidOrders.flatMap((order) =>
    order.items.map((item) => ({
      ticketTypeId: item.ticketTypeId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }))
  );
  const stats = summarizeOrganizerEvent(event.ticketTypes, paidItems, scannedCount, event.capacity);

  return {
    event,
    stats,
    paidOrders,
    refundedOrders,
    pendingOrders: event.orders.filter((order) => order.status !== "PAID" && order.status !== "REFUNDED"),
  };
}
