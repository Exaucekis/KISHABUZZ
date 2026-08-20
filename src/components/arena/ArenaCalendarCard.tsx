import Link from "next/link";
import { arenaShowPlace, arenaTicketCta, type ArenaCalendarEvent } from "@/lib/arena-calendar";
import { formatDate } from "@/lib/utils";

type Show = {
  slug: string;
  title: string;
  theme: string;
  poster: string;
  number: number;
  status: string;
  airDate: Date | null;
  airTime: string;
  venueName: string;
  guests: { guest: { name: string; visible?: boolean } }[];
  event: ArenaCalendarEvent | null;
};

export function ArenaCalendarCard({ show }: { show: Show }) {
  const guests = show.guests
    .map((item) => item.guest)
    .filter((guest) => guest.visible !== false)
    .map((guest) => guest.name);
  const place = arenaShowPlace(show, show.event);
  const ticket = arenaTicketCta(show.event);
  const announced = show.status === "SCHEDULED";

  return (
    <article className="ac-cal-card">
      <div className="ac-cal-date" aria-hidden={!show.airDate}>
        {show.airDate ? (
          <>
            <span className="ac-cal-date__week">{formatDate(show.airDate, "EEE")}</span>
            <span className="ac-cal-date__day">{formatDate(show.airDate, "d")}</span>
            <span className="ac-cal-date__month">{formatDate(show.airDate, "MMM")}</span>
          </>
        ) : (
          <>
            <span className="ac-cal-date__week">Date</span>
            <span className="ac-cal-date__day">?</span>
            <span className="ac-cal-date__month">TBD</span>
          </>
        )}
      </div>
      <div className="ac-cal-card__media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={show.poster || "/artists/fally-ipupa.jpg"} alt="" loading="lazy" />
      </div>
      <div className="ac-cal-card__body">
        <p className="ac-kicker">
          {announced ? "Annoncé" : "À la une"} · Épisode {String(show.number).padStart(2, "0")}
        </p>
        <h2>
          <Link href={`/arena-culture/emissions/${show.slug}`}>{show.title}</Link>
        </h2>
        <p>
          {[
            show.airDate
              ? `${formatDate(show.airDate, "EEEE d MMMM yyyy")}${show.airTime ? ` · ${show.airTime}` : ""}`
              : "Date à confirmer",
            place || "Lieu à confirmer",
            guests.join(", ") || null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {show.theme ? <p>{show.theme}</p> : null}
        <div className="ac-cal-card__actions">
          <Link href={`/arena-culture/emissions/${show.slug}`} className="ac-btn ac-btn--ghost">
            Voir l&apos;émission
          </Link>
          {ticket ? (
            <Link
              href={ticket.href}
              className={`ac-btn ${ticket.kind === "soldout" ? "ac-btn--ghost" : "ac-btn--primary"}`}
            >
              {ticket.label}
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
