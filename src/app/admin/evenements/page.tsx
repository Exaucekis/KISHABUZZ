import Link from "next/link";
import { deleteEvent, setEventStatus } from "@/actions/admin/events";
import { EventAdminNav } from "@/components/admin/EventAdminNav";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { remainingSeats } from "@/lib/events";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Événements" };

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    include: {
      category: { select: { name: true } },
      ticketTypes: { select: { quantity: true, soldCount: true, reservedCount: true } },
      _count: { select: { orders: true } },
    },
    orderBy: [{ startsAt: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <AdminPageIntro
        title="Événements & billetterie"
        hint="Créez l’événement, définissez la jauge et les tarifs, puis publiez. La somme des tarifs ne peut pas dépasser la capacité."
        actions={
          <Link href="/admin/evenements/new" className="admin-btn admin-btn-primary">
            Nouvel événement
          </Link>
        }
      />
      <EventAdminNav current="/admin/evenements" />

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
            {events.map((event) => {
              const remaining = event.ticketTypes.reduce((sum, type) => sum + remainingSeats(type), 0);
              const stock = event.ticketTypes.reduce((sum, type) => sum + type.quantity, 0);
              const capacity = event.capacity > 0 ? event.capacity : stock;
              return (
                <tr key={event.id}>
                  <td>
                    <Link href={`/admin/evenements/${event.id}`} className="font-medium hover:underline">
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
                        href={`/organisateur/evenements/${event.id}`}
                        className="admin-btn admin-btn-ghost text-xs"
                      >
                        Stats
                      </Link>
                      <Link
                        href={`/admin/evenements/${event.id}`}
                        className="admin-btn admin-btn-ghost text-xs"
                      >
                        Éditer
                      </Link>
                      {event.status !== "PUBLISHED" ? (
                        <form action={setEventStatus}>
                          <input type="hidden" name="id" value={event.id} />
                          <input type="hidden" name="status" value="PUBLISHED" />
                          <button type="submit" className="admin-btn admin-btn-ghost text-xs">
                            Publier
                          </button>
                        </form>
                      ) : (
                        <form action={setEventStatus}>
                          <input type="hidden" name="id" value={event.id} />
                          <input type="hidden" name="status" value="DRAFT" />
                          <button type="submit" className="admin-btn admin-btn-ghost text-xs">
                            Dépublier
                          </button>
                        </form>
                      )}
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
            {!events.length ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#9aa3b5]">
                  Aucun événement. Créez le premier pour ouvrir la billetterie.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
