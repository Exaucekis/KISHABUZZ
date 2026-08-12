import type { Metadata } from "next";
import Link from "next/link";
import { ArenaPageIntro } from "@/components/arena/ArenaPageIntro";
import { EmptyState } from "@/components/ui/EmptyState";
import { getArchivedShows, getArenaSeasons } from "@/lib/data";
import { cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Archives · Arena Culture",
  description: "Archives des émissions Arena Culture par année et saison.",
};

type Props = {
  searchParams: Promise<{ annee?: string; saison?: string }>;
};

export default async function ArenaArchivesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const year = sp.annee ? Number(sp.annee) : undefined;
  const seasonId = sp.saison || undefined;

  const [seasons, shows] = await Promise.all([
    getArenaSeasons(),
    getArchivedShows({
      year: year && !Number.isNaN(year) ? year : undefined,
      seasonId,
    }),
  ]);

  const years = Array.from(new Set(seasons.map((s) => s.year))).sort((a, b) => b - a);

  return (
    <>
      <ArenaPageIntro
        title="Archives"
        description="Parcours les saisons et émissions déjà diffusées."
      />

      <section className="ac-page">
        <div className="mb-10 space-y-6">
          <div>
            <p className="ac-kicker mb-3">Année</p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/arena-culture/archives"
                className={cn(
                  "rounded-full border px-4 py-2.5 text-sm",
                  !year && !seasonId
                    ? "border-[var(--ac-amber)] bg-[var(--ac-amber)] text-black"
                    : "border-line text-paper-muted hover:text-paper"
                )}
              >
                Toutes
              </Link>
              {years.map((y) => (
                <Link
                  key={y}
                  href={`/arena-culture/archives?annee=${y}`}
                  className={cn(
                    "rounded-full border px-4 py-2.5 text-sm",
                    year === y
                      ? "border-[var(--ac-amber)] bg-[var(--ac-amber)] text-black"
                      : "border-line text-paper-muted hover:text-paper"
                  )}
                >
                  {y}
                </Link>
              ))}
            </div>
          </div>

          {seasons.length ? (
            <div>
              <p className="ac-kicker mb-3">Saison</p>
              <div className="flex flex-wrap gap-2">
                {seasons.map((s) => (
                  <Link
                    key={s.id}
                    href={`/arena-culture/archives?saison=${s.id}`}
                    className={cn(
                      "rounded-full border px-4 py-2.5 text-sm",
                      seasonId === s.id
                        ? "border-[var(--ac-amber)] bg-[var(--ac-amber)] text-black"
                        : "border-line text-paper-muted hover:text-paper"
                    )}
                  >
                    {s.title || `Saison ${s.number}`} ({s.year})
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {shows.length ? (
          <ul className="divide-y divide-line border-y border-line">
            {shows.map((show) => (
              <li key={show.id}>
                <Link
                  href={`/arena-culture/emissions/${show.slug}`}
                  className="flex flex-col gap-2 py-5 transition hover:opacity-90 focus-ring md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="ac-kicker">
                      Ép. {String(show.number).padStart(2, "0")}
                      {show.season ? ` · ${show.season.title || `S${show.season.number}`}` : ""}
                    </p>
                    <h2 className="mt-1 font-display text-xl md:text-2xl">{show.title}</h2>
                    {show.theme ? <p className="mt-1 text-sm text-paper-muted">{show.theme}</p> : null}
                  </div>
                  {show.airDate ? (
                    <p className="text-sm text-paper-muted">{formatDate(show.airDate)}</p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Aucune archive pour ce filtre"
            description={
              years.length || seasons.length
                ? "Modifiez l'année ou la saison, ou revenez à toutes les archives."
                : "Les archives apparaîtront dès qu'une émission sera publiée."
            }
          />
        )}
      </section>
    </>
  );
}
