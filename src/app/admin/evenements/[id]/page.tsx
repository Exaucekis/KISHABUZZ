import { notFound } from "next/navigation";
import { EventAdminNav } from "@/components/admin/EventAdminNav";
import { EventForm } from "@/components/admin/EventForm";
import { EventStaffManager } from "@/components/admin/EventStaffManager";
import { EventCancelForm } from "@/components/admin/EventCancelForm";
import { EventAuditList } from "@/components/admin/EventAuditList";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { RefundOrderForm } from "@/components/events/RefundOrderForm";
import { auth } from "@/lib/auth";
import { formatMoney, orderStatusLabel } from "@/lib/events";
import { listEventOrganizerOptions } from "@/lib/organizer";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id }, select: { title: true } });
  return { title: event ? `Éditer · ${event.title}` : "Événement" };
}

export default async function EditEventPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { notice } = await searchParams;
  const session = await auth();
  const [event, categories, paidOrders, auditLogs] = await Promise.all([
    prisma.event.findUnique({
      where: { id },
      include: {
        ticketTypes: { orderBy: { sortOrder: "asc" }, include: { sessions: true } },
        sessions: { orderBy: { sortOrder: "asc" } },
        staff: { include: { user: { select: { name: true, email: true } } }, orderBy: { role: "asc" } },
        media: { where: { kind: "IMAGE" }, orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.eventCategory.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
    }),
    prisma.ticketOrder.findMany({
      where: { eventId: id, status: "PAID" },
      orderBy: { createdAt: "desc" },
      take: 40,
      select: {
        id: true,
        orderNumber: true,
        buyerName: true,
        buyerEmail: true,
        amount: true,
        currency: true,
        status: true,
      },
    }),
    prisma.eventAuditLog.findMany({
      where: { eventId: id },
      include: { actor: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
  ]);
  if (!event) notFound();

  const organizers = await listEventOrganizerOptions(event.organizerId || session?.user?.id);

  return (
    <div>
      <AdminPageIntro
        title={`Éditer · ${event.title}`}
        hint="Capacité, tarifs, galerie et organisateur. La jauge ne peut pas passer sous les places déjà prises."
      />
      <EventAdminNav current="/admin/evenements" />
      <EventForm
        notice={notice}
        event={{
          id: event.id,
          title: event.title,
          summary: event.summary,
          description: event.description,
          poster: event.poster,
          startsAt: event.startsAt,
          endsAt: event.endsAt,
          venueName: event.venueName,
          address: event.address,
          city: event.city,
          categoryId: event.categoryId,
          organizerId: event.organizerId,
          capacity: event.capacity,
          status: event.status,
          currency: event.currency,
          salesOpensAt: event.salesOpensAt,
          salesClosesAt: event.salesClosesAt,
          featured: event.featured,
          gallery: event.media.map((item) => ({ id: item.id, url: item.url })),
          sessions: event.sessions.map((session) => ({
            id: session.id,
            startsAt: session.startsAt,
            endsAt: session.endsAt,
            access: session.access,
          })),
          ticketTypes: event.ticketTypes.map((type) => ({
            id: type.id,
            name: type.name,
            description: type.description,
            benefits: type.benefits,
            price: type.price,
            quantity: type.quantity,
            maxPerOrder: type.maxPerOrder,
            visible: type.visible,
            soldCount: type.soldCount,
            reservedCount: type.reservedCount,
            sessionKeys: type.sessions.map((row) => row.sessionId),
          })),
        }}
        categories={categories}
        organizers={organizers}
        currentUserId={session?.user?.id}
      />
      <EventStaffManager
        eventId={event.id}
        staff={event.staff.map((row) => ({
          userId: row.userId,
          role: row.role,
          user: row.user,
        }))}
      />
      <div className="admin-card mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#9aa3b5]">
          Commandes payées
        </h2>
        <p className="admin-hint">
          Remboursez d’abord dans CinetPay, puis marquez ici. Le restock remet les places non scannées en
          vente.
        </p>
        <div className="mt-4 space-y-4">
          {paidOrders.map((order) => (
            <div key={order.id} className="rounded-md border border-white/10 p-3">
              <p className="text-sm font-medium">
                {order.orderNumber} · {order.buyerName}
              </p>
              <p className="mt-1 text-xs text-[#9aa3b5]">
                {order.buyerEmail} · {formatMoney(order.amount, order.currency)} ·{" "}
                {orderStatusLabel(order.status)}
              </p>
              <div className="mt-3">
                <RefundOrderForm
                  orderId={order.id}
                  amount={order.amount}
                  currency={order.currency}
                  variant="admin"
                />
              </div>
            </div>
          ))}
          {!paidOrders.length ? (
            <p className="text-sm text-[#9aa3b5]">Aucune commande payée à rembourser.</p>
          ) : null}
        </div>
      </div>
      <EventCancelForm eventId={event.id} disabled={event.status === "CANCELLED"} />
      <EventAuditList logs={auditLogs} />
    </div>
  );
}
