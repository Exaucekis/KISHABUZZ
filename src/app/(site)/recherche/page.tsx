import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { searchAll } from "@/lib/data";
import { formatDate, portfolioTypeLabel } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Recherche",
  description: "Rechercher dans les contenus KISHA BUZZ.",
};

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function RecherchePage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const results = await searchAll(query);
  const total =
    results.articles.length +
    results.shows.length +
    results.guests.length +
    results.portfolio.length +
    results.partners.length +
    results.media.length;

  return (
    <>
      <section className="border-b border-line bg-ink-2 pt-28 pb-14">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <SectionHeading
            eyebrow="Explorer"
            title="Recherche"
            description="Cherchez parmi les chroniques, publications, émissions, invités et projets."
          />
          <form action="/recherche" className="mt-8 flex gap-2">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Mot-clé…"
              minLength={2}
              className="w-full border border-line bg-ink-2 px-4 py-3 text-paper focus-ring"
              aria-label="Rechercher"
            />
            <button
              type="submit"
              className="rounded-md bg-ember px-5 py-3 text-sm font-semibold text-on-ember hover:bg-ember-hot focus-ring"
            >
              Chercher
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-10 px-4 py-12 md:px-6 md:py-16">
        {!query || query.length < 2 ? (
          <EmptyState
            title="Saisissez une recherche"
            description="Entrez au moins 2 caractères pour lancer la recherche."
          />
        ) : total === 0 ? (
          <EmptyState
            title="Aucun résultat"
            description={`Aucune correspondance pour « ${query} ».`}
          />
        ) : (
          <>
            <p className="text-sm text-paper-muted">
              {total} résultat{total > 1 ? "s" : ""} pour « {query} »
            </p>

            {results.articles.length ? (
              <ResultBlock title="Articles & chroniques">
                {results.articles.map((a) => (
                  <ResultLink
                    key={a.id}
                    href={
                      a.contentType === "CHRONIQUE"
                        ? `/chroniques/${a.slug}`
                        : `/publications/${a.slug}`
                    }
                    title={a.title}
                    meta={a.publishedAt ? formatDate(a.publishedAt) : undefined}
                  />
                ))}
              </ResultBlock>
            ) : null}

            {results.shows.length ? (
              <ResultBlock title="Émissions Arena Culture">
                {results.shows.map((s) => (
                  <ResultLink
                    key={s.id}
                    href={`/arena-culture/emissions/${s.slug}`}
                    title={s.title}
                    meta={s.theme || undefined}
                  />
                ))}
              </ResultBlock>
            ) : null}

            {results.guests.length ? (
              <ResultBlock title="Invités">
                {results.guests.map((g) => (
                  <ResultLink
                    key={g.id}
                    href="/arena-culture/invites"
                    title={g.name}
                    meta={g.profession || undefined}
                  />
                ))}
              </ResultBlock>
            ) : null}

            {results.portfolio.length ? (
              <ResultBlock title="Portfolio">
                {results.portfolio.map((p) => (
                  <ResultLink
                    key={p.id}
                    href={`/portfolio/${p.slug}`}
                    title={p.title}
                    meta={portfolioTypeLabel(p.type)}
                  />
                ))}
              </ResultBlock>
            ) : null}

            {results.partners.length ? (
              <ResultBlock title="Partenaires">
                {results.partners.map((p) => (
                  <ResultLink
                    key={p.id}
                    href="/collaborations"
                    title={p.name}
                    meta={p.description || undefined}
                  />
                ))}
              </ResultBlock>
            ) : null}

            {results.media.length ? (
              <ResultBlock title="Médias">
                {results.media.map((m) => (
                  <ResultLink
                    key={m.id}
                    href={m.kind === "VIDEO" ? "/arena-culture/videos" : "/arena-culture/photos"}
                    title={m.title}
                    meta={m.kind === "VIDEO" ? "Vidéo Arena" : "Photo Arena"}
                  />
                ))}
              </ResultBlock>
            ) : null}
          </>
        )}
      </section>
    </>
  );
}

function ResultBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 font-display text-2xl">{title}</h2>
      <ul className="divide-y divide-line border border-line">{children}</ul>
    </div>
  );
}

function ResultLink({
  href,
  title,
  meta,
}: {
  href: string;
  title: string;
  meta?: string;
}) {
  return (
    <li>
      <Link href={href} className="block px-4 py-4 transition hover:bg-ink-2 focus-ring">
        <span className="font-medium">{title}</span>
        {meta ? <span className="mt-1 block text-sm text-paper-muted">{meta}</span> : null}
      </Link>
    </li>
  );
}
