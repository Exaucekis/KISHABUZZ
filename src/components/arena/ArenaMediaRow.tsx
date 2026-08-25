import Link from "next/link";
import { ArrowRight, Image as ImageIcon } from "lucide-react";

type RowItem = {
  href?: string;
  image: string;
  title: string;
  subtitle?: string;
};

type Props = {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
  items: RowItem[];
  variant?: "poster" | "wide" | "square";
};

export function ArenaMediaRow({
  eyebrow,
  title,
  href,
  linkLabel = "Tout voir",
  items,
  variant = "poster",
}: Props) {
  if (!items.length) return null;

  return (
    <section className="ac-row">
      <div className="ac-row__head">
        <div>
          {eyebrow ? <p className="ac-kicker">{eyebrow}</p> : null}
          <h2 className="ac-row__title text-2xl font-extrabold sm:text-3xl">{title}</h2>
        </div>
        {href ? (
          <Link href={href} className="ac-row__more group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300">
            <span>{linkLabel}</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        ) : null}
      </div>

      <div className="ac-row__scroller" data-variant={variant}>
        {items.map((item) => {
          const body = (
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#121620] transition-all duration-500 hover:-translate-y-1.5 hover:border-amber-400/50 hover:shadow-[0_12px_40px_rgba(245,158,11,0.2)]">
              <div className="ac-tile__media relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 transition-opacity group-hover:opacity-60" />
                <div className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-amber-400 opacity-0 transition-opacity group-hover:opacity-100">
                  <ImageIcon className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="ac-tile__meta p-3.5">
                <strong className="block text-sm font-bold text-white transition-colors group-hover:text-amber-300">
                  {item.title}
                </strong>
                {item.subtitle ? (
                  <span className="mt-0.5 block text-[0.75rem] text-white/50">{item.subtitle}</span>
                ) : null}
              </div>
            </div>
          );

          return item.href ? (
            <Link key={`${item.href}-${item.title}`} href={item.href} className="ac-tile focus-ring">
              {body}
            </Link>
          ) : (
            <div key={item.title} className="ac-tile">
              {body}
            </div>
          );
        })}
      </div>
    </section>
  );
}
