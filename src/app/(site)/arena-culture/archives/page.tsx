import type { Metadata } from "next";
import Link from "next/link";
import { ArenaPageIntro } from "@/components/arena/ArenaPageIntro";
import { EmptyState } from "@/components/ui/EmptyState";
import { VideoEmbed } from "@/components/media/VideoEmbed";
import { getArenaArchiveBundle, getArenaSeasons } from "@/lib/data";
import { videoPoster } from "@/lib/media";
import { cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Archives · Arena Culture",
  description: "Archives des émissions, vidéos et visuels Arena Culture.",
};

type Props = {
  searchParams: Promise<{ annee?: string; saison?: string }>;
};

export default async function ArenaArchivesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const year = sp.annee ? Number(sp.annee) : undefined;
  const seasonId = sp.saison || undefined;
  const yearFilter = year && !Number.isNaN(year) ? year : undefined;

  const [seasons, bundle] = await Promise.all([
    getArenaSeasons(),
    getArenaArchiveBundle({
      year: yearFilter,
      seasonId,
    }),
  ]);
  const { shows, videos, visuals } = bundle;
  const years = Array.from(new Set(seasons.map((s) => s.year))).sort((a, b) => b - a);

  return (
    <>
      <ArenaPageIntro
        title="Archives"
        description="Émissions remplacées, anciennes vidéos et visuels — tout ce qui n’est plus en première."
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

        <div className="space-y-16">
          <div>
            <p className="ac-kicker mb-3">01 · Émissions</p>
            <h2 className="mb-6 font-display text-2xl md:text-3xl">Épisodes archivés</h2>
            {shows.length ? (
              <ul className="divide-y divide-line border-y border-line">
                {shows.map((show) => (
                  <li key={show.id}>
                    <Link
                      href={`/arena-culture/emissions/${show.slug}`}
                      className="flex flex-col gap-3 py-5 transition hover:opacity-90 focus-ring md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        {show.poster ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={show.poster}
                            alt=""
                            className="h-20 w-14 shrink-0 rounded object-cover"
                            loading="lazy"
                          />
                        ) : null}
                        <div className="min-w-0">
                          <p className="ac-kicker">
                            Ép. {String(show.number).padStart(2, "0")}
                            {show.season ? ` · ${show.season.title || `S${show.season.number}`}` : ""}
                            {show.videoUrl ? " · Vidéo" : ""}
                          </p>
                          <h3 className="mt-1 font-display text-xl md:text-2xl">{show.title}</h3>
                          {show.theme ? <p className="mt-1 text-sm text-paper-muted">{show.theme}</p> : null}
                        </div>
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
                title="Aucune émission archivée pour ce filtre"
                description={
                  years.length || seasons.length
                    ? "Modifiez l'année ou la saison, ou revenez à toutes les archives."
                    : "Les archives se remplissent dès qu’une nouvelle émission passe en première."
                }
              />
            )}
          </div>

          {!year && !seasonId ? (
            <div>
              <p className="ac-kicker mb-3">02 · Vidéos</p>
              <h2 className="mb-6 font-display text-2xl md:text-3xl">Anciennes vidéos</h2>
              {videos.length ? (
                <div className="ac-videos">
                  {videos.map((video) => (
                    <div key={video.id} className="min-w-0">
                      <VideoEmbed
                        url={video.url}
                        title={video.title}
                        poster={videoPoster(video.url, video.thumbnail)}
                        lazy
                      />
                      <p className="mt-4 font-display text-xl">{video.title}</p>
                      {video.arenaShow ? (
                        <Link
                          href={`/arena-culture/emissions/${video.arenaShow.slug}`}
                          className="mt-1 block text-sm text-[var(--ac-amber)] hover:underline"
                        >
                          {video.arenaShow.title}
                        </Link>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-paper-muted">Pas encore d’ancienne vidéo dans ce filtre.</p>
              )}
            </div>
          ) : null}

          {!year && !seasonId && visuals.length ? (
            <div>
              <p className="ac-kicker mb-3">03 · Visuels</p>
              <h2 className="mb-6 font-display text-2xl md:text-3xl">Anciens visuels de la page</h2>
              <div className="ac-grid-posters">
                {visuals.map((item) => (
                  <div key={item.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.thumbnail || item.url} alt={item.alt || item.title} loading="lazy" />
                    <p>{item.title.replace(/^Archive · /, "")}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

        </div>
      </section>
    </>
  );
}
