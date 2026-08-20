import { notFound } from "next/navigation";
import Link from "next/link";
import {
  EventAdminNav,
  EventEditNav,
} from "@/components/admin/EventAdminNav";
import { parseEventEditTab } from "@/lib/event-admin-views";
import { EventForm } from "@/components/admin/EventForm";
import { EventStaffManager } from "@/components/admin/EventStaffManager";
import { EventCancelForm } from "@/components/admin/EventCancelForm";
import { EventAuditList } from "@/components/admin/EventAuditList";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { RefundOrderForm } from "@/components/events/RefundOrderForm";
import { auth } from "@/lib/auth";
import { isLiveEventStatus } from "@/lib/event-capacity";
import { eventPlace, eventStatusLabel, formatMoney, orderStatusLabel } from "@/lib/events";
import { listEventOrganizerOptions } from "@/lib/organizer";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; saved?: string; onglet?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id }, select: { title: true } });
  return { title: event ? `Événement · ${event.title}` : "Événement" };
}

export default async function EditEventPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { notice, saved, onglet } = await searchParams;
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
  const tab = parseEventEditTab(onglet, event.status);
  const live = isLiveEventStatus(event.status);
  const navCurrent = live ? "en-cours" : event.status === "DRAFT" ? "brouillons" : "passes";

  const form = (
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
  );

  const livePanel = (
    <>
      <div className="admin-card">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
          Événement en cours
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <h2 className="font-display text-2xl uppercase">{event.title}</h2>
          <StatusBadge status={event.status} />
        </div>
        <p className="mt-3 text-sm text-[#aeb6c5]">
          {formatDate(event.startsAt, "EEEE d MMMM yyyy · HH:mm")}
          {eventPlace(event) ? ` · ${eventPlace(event)}` : ""}
        </p>
        {!live ? (
          <p className="mt-3 text-sm text-amber-200">
            Statut : {eventStatusLabel(event.status)}. Passez-le à Publié dans l’onglet Fiche pour
            ouvrir les ventes.
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={`/evenements/${event.slug}`} className="admin-btn admin-btn-primary text-xs">
            Voir la fiche publique
          </Link>
          <Link href={`/scan?event=${event.id}`} className="admin-btn admin-btn-ghost text-xs">
            Scanner l’entrée
          </Link>
          <Link href={`/organisateur/evenements/${event.id}`} className="admin-btn admin-btn-ghost text-xs">
            Tableau organisateur
          </Link>
          <Link
            href={`/admin/evenements/${event.id}?onglet=fiche`}
            className="admin-btn admin-btn-ghost text-xs"
          >
            Modifier la fiche
          </Link>
        </div>
      </div>
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
          Remboursez d’abord dans CinetPay, puis marquez ici. Le restock remet les places non scannées
          en vente.
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
    </>
  );

  return (
    <div>
      <AdminPageIntro
        title={tab === "en-cours" ? event.title : `Fiche · ${event.title}`}
        hint={
          tab === "en-cours"
            ? "Pilotage : fiche publique, scan, staff et commandes. La fiche de création est dans l’onglet Fiche."
            : tab === "journal"
              ? "Historique des changements, annulations et remboursements."
              : "Capacité, tarifs, galerie et organisateur. La jauge ne peut pas passer sous les places déjà prises."
        }
        actions={
          <>
            <Link href={`/evenements/${event.slug}`} className="admin-btn admin-btn-primary text-xs">
              Voir la fiche publique
            </Link>
            <Link href="/admin/evenements?vue=en-cours" className="admin-btn admin-btn-ghost text-xs">
              Événements en cours
            </Link>
          </>
        }
      />
      {saved ? (
        <p className="mb-4 text-sm text-emerald-300">
          Enregistré
          {live ? " et publié" : ""}. Il apparaît dans l’onglet{" "}
          <Link href="/admin/evenements?vue=en-cours" className="underline">
            En cours
          </Link>
          .
        </p>
      ) : null}
      <EventAdminNav current={navCurrent} />
      <EventEditNav eventId={event.id} current={tab} />
      {tab === "en-cours" ? livePanel : null}
      {tab === "fiche" ? form : null}
      {tab === "journal" ? <EventAuditList logs={auditLogs} /> : null}
    </div>
  );
}
