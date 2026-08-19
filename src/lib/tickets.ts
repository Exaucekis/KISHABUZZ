import { prisma } from "@/lib/prisma";

export async function getOwnedTicket(ticketId: string, userId: string) {
  return prisma.ticket.findFirst({
    where: { id: ticketId, userId, order: { status: { in: ["PAID", "REFUNDED"] } } },
    include: {
      event: {
        select: {
          title: true,
          slug: true,
          startsAt: true,
          endsAt: true,
          sessions: { select: { id: true, startsAt: true, endsAt: true, access: true, label: true } },
          venueName: true,
          city: true,
          address: true,
          poster: true,
        },
      },
      ticketType: { select: { name: true, price: true, sessions: { include: { session: true } } } },
      order: { select: { orderNumber: true, currency: true, amount: true, status: true } },
    },
  });
}

export async function getTicketByPublicCode(publicCode: string) {
  return prisma.ticket.findUnique({
    where: { publicCode },
    include: {
      event: {
        select: { title: true, slug: true, startsAt: true, venueName: true, city: true, address: true },
      },
      ticketType: { select: { name: true } },
      order: { select: { status: true } },
    },
  });
}
