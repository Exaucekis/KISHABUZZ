import Link from "next/link";
import { deleteEvent, setEventStatus } from "@/actions/admin/events";
import { EventAdminNav } from "@/components/admin/EventAdminNav";
import {
  matchesEventListView,
  parseEventListView,
  type EventListView,
} from "@/lib/event-admin-views";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { remainingSeats } from "@/lib/events";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Événements" };

const VIEW_COPY: Record<EventListView, { title: string; hint: string; empty: string }> = {
  "en-cours": {
    title: "Événements en cours",
    hint: "Publiés ou complets : ventes, scan et staff. La création reste sur « Nouvel événement ».",
    empty: "Aucun événement en cours. Publiez un événement pour le voir ici.",
  },
  brouillons: {
    title: "Brouillons",
    hint: "Événements pas encore publiés. Terminez la fiche puis passez le statut à Publié.",
    empty: "Aucun brouillon.",
  },
  passes: {
    title: "Événements passés",
    hint: "Terminés ou annulés.",
    empty: "Aucun événement terminé ou annulé.",
  },
  tous: {
    title: "Tous les événements",
    hint: "Créez l’événement, définissez la jauge et les tarifs, puis publiez.",
    empty: "Aucun événement. Créez le premier pour ouvrir la billetterie.",
  },
};

type Props = { searchParams: Promise<{ vue?: string }> };

export default async function AdminEventsPage({ searchParams }: Props) {
  const { vue } = await searchParams;
  const view = parseEventListView(vue);
  const events = await prisma.event.findMany({
    include: {
      category: { select: { name: true } },
      ticketTypes: { select: { quantity: true, soldCount: true, reservedCount: true } },
      _count: { select: { orders: true } },
    },
    orderBy: [{ startsAt: "desc" }, { createdAt: "desc" }],
  });
  const counts = {
    "en-cours": events.filter((event) => matchesEventListView(event.status, "en-cours")).length,
    brouillons: events.filter((event) => matchesEventListView(event.status, "brouillons")).length,
    passes: events.filter((event) => matchesEventListView(event.status, "passes")).length,
    tous: events.length,
  };
  const visible = events.filter((event) => matchesEventListView(event.status, view));
  const copy = VIEW_COPY[view];

  return (
    <div>
      <AdminPageIntro
        title={copy.title}
        hint={copy.hint}
        actions={
          <Link href="/admin/evenements/new" className="admin-btn admin-btn-primary">
            Nouvel événement
          </Link>
        }
      />
      <EventAdminNav current={view} counts={counts} />

      <div className="admin-card overflow-x-auto p-0">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Événement</th>
              <th>Date</th>
              <th>Lieu</th>
              <th>Places</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((event) => {
              const remaining = event.ticketTypes.reduce((sum, type) => sum + remainingSeats(type), 0);
              const stock = event.ticketTypes.reduce((sum, type) => sum + type.quantity, 0);
              const capacity = event.capacity > 0 ? event.capacity : stock;
              const openTab = event.status === "DRAFT" ? "fiche" : "en-cours";
              return (
                <tr key={event.id}>
                  <td>
                    <Link
                      href={`/admin/evenements/${event.id}?onglet=${openTab}`}
                      className="font-medium hover:underline"
                    >
                      {event.title}
                    </Link>
                    <p className="text-xs text-[#9aa3b5]">
                      {[event.category?.name, event.featured ? "À la une" : null]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </p>
                  </td>
                  <td className="whitespace-nowrap text-[#aeb6c5]">
                    {formatDate(event.startsAt, "d MMM yyyy HH:mm")}
                  </td>
                  <td className="text-[#aeb6c5]">{event.city || event.venueName || "—"}</td>
                  <td className="tabular-nums text-[#aeb6c5]">
                    {capacity ? `${remaining} / ${capacity}` : "—"}
                  </td>
                  <td>
                    <StatusBadge status={event.status} />
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      <Link
                        href={`/admin/evenements/${event.id}?onglet=en-cours`}
                        className="admin-btn admin-btn-ghost text-xs"
                      >
                        En cours
                      </Link>
                      <Link
                        href={`/organisateur/evenements/${event.id}`}
                        className="admin-btn admin-btn-ghost text-xs"
                      >
                        Stats
                      </Link>
                      <Link
                        href={`/admin/evenements/${event.id}?onglet=fiche`}
                        className="admin-btn admin-btn-ghost text-xs"
                      >
                        Fiche
                      </Link>
                      {event.status === "DRAFT" ? (
                        <form action={setEventStatus}>
                          <input type="hidden" name="id" value={event.id} />
                          <input type="hidden" name="status" value="PUBLISHED" />
                          <button type="submit" className="admin-btn admin-btn-ghost text-xs">
                            Publier
                          </button>
                        </form>
                      ) : null}
                      {event.status === "PUBLISHED" && !event._count.orders ? (
                        <form action={setEventStatus}>
                          <input type="hidden" name="id" value={event.id} />
                          <input type="hidden" name="status" value="DRAFT" />
                          <button type="submit" className="admin-btn admin-btn-ghost text-xs">
                            Dépublier
                          </button>
                        </form>
                      ) : null}
                      {event._count.orders &&
                      (event.status === "PUBLISHED" || event.status === "SOLD_OUT") ? (
                        <Link
                          href={`/admin/evenements/${event.id}?onglet=en-cours`}
                          className="admin-btn admin-btn-danger text-xs"
                        >
                          Annuler
                        </Link>
                      ) : null}
                      {!event._count.orders ? (
                        <form action={deleteEvent}>
                          <input type="hidden" name="id" value={event.id} />
                          <button type="submit" className="admin-btn admin-btn-danger text-xs">
                            Suppr.
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
            {!visible.length ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#9aa3b5]">
                  {copy.empty}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
