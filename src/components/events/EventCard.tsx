import Link from "next/link";
import { eventPlace, formatMoney, lowestVisiblePrice, remainingSeats } from "@/lib/events";
import { formatDate } from "@/lib/utils";

type EventCardProps = {
  href: string;
  title: string;
  summary?: string;
  poster?: string;
  category?: string | null;
  startsAt: Date;
  venueName?: string;
  city?: string;
  address?: string;
  currency?: string;
  featured?: boolean;
  ticketTypes: { price: number; quantity: number; soldCount: number; reservedCount: number; visible?: boolean }[];
};

export function EventCard({
  href,
  title,
  summary,
  poster,
  category,
  startsAt,
  venueName,
  city,
  address,
  currency = "CDF",
  featured,
  ticketTypes,
}: EventCardProps) {
  const fromPrice = lowestVisiblePrice(ticketTypes);
  const remaining = ticketTypes.reduce((sum, type) => sum + remainingSeats(type), 0);

  return (
    <article className="group kb-card-motion min-w-0">
      <Link href={href} className="block focus-ring">
        <div className="kb-shine relative aspect-[16/10] overflow-hidden bg-ink-3">
          {poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={poster}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-full w-full items-end bg-gradient-to-br from-ember/30 via-ink-3 to-ink p-4">
              <span className="font-display text-3xl text-paper/30">KB</span>
            </div>
          )}
          {featured ? (
            <span className="absolute left-3 top-3 rounded-full bg-ember px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-on-ember">
              À la une
            </span>
          ) : null}
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-paper-muted">
            {category ? <span className="font-semibold text-ember-text">{category}</span> : null}
            <span>{formatDate(startsAt, "d MMM yyyy · HH:mm")}</span>
          </div>
          <h3 className="font-display text-xl leading-snug transition group-hover:text-ember-text md:text-2xl">
            {title}
          </h3>
          {summary ? (
            <p className="line-clamp-2 text-sm leading-relaxed text-paper-muted">{summary}</p>
          ) : null}
          <p className="text-sm text-paper-muted">
            {eventPlace({ venueName, city, address }) || "Lieu à confirmer"}
          </p>
          <p className="text-sm font-semibold text-paper">
            {fromPrice != null ? `À partir de ${formatMoney(fromPrice, currency)}` : "Tarifs à venir"}
            {remaining ? ` · ${remaining} place${remaining > 1 ? "s" : ""}` : ""}
          </p>
        </div>
      </Link>
    </article>
  );
}
