import Link from "next/link";

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
          <h2 className="ac-row__title">{title}</h2>
        </div>
        {href ? (
          <Link href={href} className="ac-row__more">
            {linkLabel}
          </Link>
        ) : null}
      </div>

      <div className="ac-row__scroller" data-variant={variant}>
        {items.map((item) => {
          const body = (
            <>
              <div className="ac-tile__media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt="" loading="lazy" decoding="async" />
              </div>
              <div className="ac-tile__meta">
                <strong>{item.title}</strong>
                {item.subtitle ? <span>{item.subtitle}</span> : null}
              </div>
            </>
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
