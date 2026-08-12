import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPortfolio } from "@/lib/data";
import { cn, formatDate, portfolioTypeLabel } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Reportages, interviews, couvertures d'événements, productions et activités médiatiques.",
};

const TYPES = [
  "REPORTAGE",
  "INTERVIEW",
  "EVENT_COVERAGE",
  "PRODUCTION",
  "EMISSION",
  "MEDIA_ACTIVITY",
] as const;

type Props = {
  searchParams: Promise<{ type?: string }>;
};

export default async function PortfolioPage({ searchParams }: Props) {
  const { type } = await searchParams;
  const active = type && TYPES.includes(type as (typeof TYPES)[number]) ? type : undefined;
  const items = await getPortfolio({ type: active });

  return (
    <>
      <section className="border-b border-line bg-ink-2 pt-28 pb-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeading
            eyebrow="Productions"
            title="Portfolio média"
            description="Reportages, interviews, couvertures, productions et activités médiatiques."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/portfolio"
            className={cn(
              "rounded-md border px-3 py-2 text-sm",
              !active
                ? "border-ember bg-ember text-on-ember"
                : "border-line text-paper-muted hover:text-paper"
            )}
          >
            Tout
          </Link>
          {TYPES.map((t) => (
            <Link
              key={t}
              href={`/portfolio?type=${t}`}
              className={cn(
                "rounded-md border px-3 py-2 text-sm",
                active === t
                  ? "border-ember bg-ember text-on-ember"
                  : "border-line text-paper-muted hover:text-paper"
              )}
            >
              {portfolioTypeLabel(t)}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6 md:pb-20">
        {items.length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/portfolio/${item.slug}`}
                className="group border border-line bg-ink-2 transition hover:border-ember/50 focus-ring"
              >
                <div className="aspect-[16/9] overflow-hidden bg-ink-3">
                  {item.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.coverImage}
                      alt=""
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-end p-5">
                      <span className="font-display text-4xl text-paper/15">KB</span>
                    </div>
                  )}
                </div>
                <div className="p-5 md:p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-ember-text">
                    {portfolioTypeLabel(item.type)}
                  </p>
                  <h2 className="mt-2 font-display text-2xl group-hover:text-ember-text md:text-3xl">
                    {item.title}
                  </h2>
                  {item.description ? (
                    <p className="mt-3 line-clamp-2 text-sm text-paper-muted">{item.description}</p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-paper-muted">
                    {item.date ? <span>{formatDate(item.date)}</span> : null}
                    {item.location ? <span>{item.location}</span> : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Portfolio en construction"
            description="Les projets médiatiques seront ajoutés depuis l'administration."
          />
        )}
      </section>
    </>
  );
}
