import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShareButtons } from "@/components/content/ShareButtons";
import { EmptyState } from "@/components/ui/EmptyState";
import { auth } from "@/lib/auth";
import { eventOnSale, eventPlace, eventStatusLabel, formatMoney, remainingSeats } from "@/lib/events";
import {
  formatSessionsSummary,
  formatSessionLine,
  formatTicketValidity,
  paidSessions,
  sessionsForTicketType,
} from "@/lib/event-schedule";
import { getEventBySlug } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Événement" };
  return {
    title: `${event.title} · Événements`,
    description: event.summary || event.description || `Événement KISHA BUZZ — ${event.title}`,
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const onSale = eventOnSale(event);
  const place = eventPlace(event);
  const schedule = event.sessions || [];
  const freeOnly = schedule.length > 0 && !paidSessions(schedule).length;
  const authSession = await auth();
  const checkoutHref = authSession?.user
    ? `/evenements/${event.slug}/commander`
    : `/connexion?callbackUrl=/evenements/${event.slug}/commander`;
  const canBuy = onSale && event.ticketTypes.some((type) => remainingSeats(type) > 0);

  return (
    <article>
      <header className="border-b border-line bg-ink-2 pt-28 pb-14">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-[1.1fr_0.9fr] md:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ember-text">
              {event.category?.name || "Événement"}
            </p>
            <h1 className="mt-3 font-display text-4xl uppercase leading-[0.95] md:text-6xl">
              {event.title}
            </h1>
            <p className="mt-5 text-lg text-paper-muted">
              {formatSessionsSummary(schedule, event.startsAt, event.endsAt)}
            </p>
            {schedule.length > 1 ? (
              <ul className="mt-4 space-y-1 text-sm text-paper-muted">
                {schedule.map((day) => (
                  <li key={day.id}>{formatSessionLine(day)}</li>
                ))}
              </ul>
            ) : null}
            {place ? <p className="mt-2 text-paper-muted">{place}</p> : null}
            {event.summary ? <p className="mt-6 max-w-xl text-lg leading-relaxed">{event.summary}</p> : null}
            <div className="mt-6">
              <ShareButtons title={event.title} path={`/evenements/${event.slug}`} />
            </div>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden bg-ink-3 md:aspect-auto md:min-h-[22rem]">
            {event.poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={event.poster} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center font-display text-6xl text-paper/20">KB</div>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-14 md:grid-cols-[1.1fr_0.9fr] md:px-6">
        <div>
          {event.description ? (
            <div className="space-y-4 whitespace-pre-line font-serif text-lg leading-relaxed text-paper-muted">
              {event.description}
            </div>
          ) : (
            <p className="text-paper-muted">Le programme détaillé sera publié ici.</p>
          )}
          {event.organizer?.name ? (
            <p className="mt-8 text-sm text-paper-muted">Organisé par {event.organizer.name}</p>
          ) : null}
          {event.media.filter((item) => item.kind === "IMAGE").length ? (
            <div className="mt-12">
              <h2 className="font-display text-2xl">Galerie</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {event.media
                  .filter((item) => item.kind === "IMAGE")
                  .map((item) => (
                    <div key={item.id} className="overflow-hidden bg-ink-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.thumbnail || item.url}
                        alt={item.alt || item.title}
                        className="aspect-[4/3] w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
              </div>
            </div>
          ) : null}
        </div>

        <aside className="border border-line bg-ink-2 p-6">
          <h2 className="font-display text-2xl">Billets</h2>
          <p className="mt-2 text-sm text-paper-muted">
            {freeOnly
              ? "Entrée libre, aucun billet à acheter."
              : event.status === "PUBLISHED" && onSale
                ? "Choisissez les catégories (VVIP, VIP, Standard…) et les quantités : un seul paiement pour le groupe."
                : `Statut : ${eventStatusLabel(event.status)}.`}
          </p>
          {event.ticketTypes.length ? (
            <ul className="mt-6 space-y-4">
              {event.ticketTypes.map((type) => {
                const left = remainingSeats(type);
                const validity = formatTicketValidity(
                  sessionsForTicketType(
                    schedule,
                    type.sessions.map((row) => row.sessionId)
                  )
                );
                return (
                  <li key={type.id} className="border-b border-line pb-4 last:border-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{type.name}</p>
                        {type.benefits || type.description ? (
                          <p className="mt-1 text-sm text-paper-muted">
                            {type.benefits || type.description}
                          </p>
                        ) : null}
                        {validity ? (
                          <p className="mt-1 text-xs uppercase tracking-wide text-ember-text">{validity}</p>
                        ) : null}
                      </div>
                      <p className="shrink-0 font-display text-lg">
                        {type.price ? formatMoney(type.price, event.currency) : "Gratuit"}
                      </p>
                    </div>
                    <p className="mt-2 text-xs uppercase tracking-wide text-paper-muted">
                      {left ? `${left} place${left > 1 ? "s" : ""} restante${left > 1 ? "s" : ""}` : "Complet"}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              title={freeOnly ? "Entrée libre" : "Tarifs à venir"}
              description={
                freeOnly
                  ? "Tous les jours de cet événement sont en entrée libre."
                  : "Les catégories de billets seront ajoutées par l’organisation."
              }
            />
          )}
          {canBuy ? (
            <Link
              href={checkoutHref}
              className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-ember px-5 py-3 text-sm font-bold text-on-ember hover:bg-ember-hot"
            >
              {authSession?.user ? "Réserver mes billets" : "Se connecter pour réserver"}
            </Link>
          ) : (
            <p className="mt-6 text-sm text-paper-muted">
              {freeOnly ? "Pas de billetterie : entrée libre." : "La vente en ligne n’est pas ouverte."}
            </p>
          )}
        </aside>
      </section>
    </article>
  );
}
