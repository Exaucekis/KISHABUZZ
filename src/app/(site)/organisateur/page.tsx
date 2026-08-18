import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import { auth } from "@/lib/auth";
import { eventPlace, eventStatusLabel, formatMoney, remainingSeats } from "@/lib/events";
import { canAccessOrganizerHome, listManagedEvents } from "@/lib/organizer";
import { formatFillPercent } from "@/lib/organizer-stats";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrganizerHomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/organisateur");
  if (!(await canAccessOrganizerHome(session.user.id, session.user.role))) {
    redirect("/scan");
  }

  const events = await listManagedEvents(session.user.id, session.user.role);

  return (
    <section className="mx-auto max-w-5xl px-4 py-28 md:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ember-text">Billetterie</p>
      <h1 className="mt-3 font-display text-4xl uppercase">Espace organisateur</h1>
      <p className="mt-4 max-w-2xl text-paper-muted">
        Ventes, chiffre d’affaires des commandes payées, remplissage et contrôles d’entrée.
      </p>
      <span className="section-line mt-6" aria-hidden />

      {!events.length ? (
        <div className="mt-10">
          <EmptyState
            title="Aucun événement"
            description="Un administrateur doit vous nommer manager, ou vous attribuer l’événement."
          />
        </div>
      ) : (
        <ul className="mt-10 space-y-4">
          {events.map((event) => {
            const sold = event.ticketTypes.reduce((sum, type) => sum + type.soldCount, 0);
            const remaining = event.ticketTypes.reduce((sum, type) => sum + remainingSeats(type), 0);
            const stock = event.ticketTypes.reduce((sum, type) => sum + type.quantity, 0);
            const revenue = event.orders.reduce((sum, order) => sum + order.amount, 0);
            const fill = formatFillPercent(sold, event.capacity > 0 ? event.capacity : stock);
            return (
              <li key={event.id}>
                <Link
                  href={`/organisateur/evenements/${event.id}`}
                  className="block border border-line bg-ink-2 p-5 hover:border-ember"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-2xl uppercase">{event.title}</p>
                      <p className="mt-1 text-sm text-paper-muted">
                        {formatDate(event.startsAt, "EEEE d MMMM yyyy · HH:mm")}
                        {eventPlace(event) ? ` · ${eventPlace(event)}` : ""}
                      </p>
                    </div>
                    <p className="text-xs uppercase tracking-wide text-ember-text">
                      {eventStatusLabel(event.status)}
                    </p>
                  </div>
                  <p className="mt-4 text-sm text-paper-muted">
                    {sold} vendus · {remaining} restants · {fill} plein · {formatMoney(revenue, event.currency)}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
