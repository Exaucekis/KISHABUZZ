import type { Metadata } from "next";
import Link from "next/link";
import { ArenaPageIntro } from "@/components/arena/ArenaPageIntro";
import { EmptyState } from "@/components/ui/EmptyState";
import { VideoEmbed } from "@/components/media/VideoEmbed";
import { archiveLabel } from "@/lib/arena-archive";
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
  const total = shows.length + videos.length + visuals.length;

  return (
    <>
      <ArenaPageIntro
        title="Archives"
        description="Émissions, vidéos et affiches qui ont quitté la une. Quand un contenu n’y figure plus, l’équipe l’a retiré."
      />

      <section className="ac-page">
        <div className="ac-archive-toolbar">
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

        <div className="ac-archive-stats" aria-label="Contenu des archives">
          <span>
            <strong>{shows.length}</strong> émission{shows.length > 1 ? "s" : ""}
          </span>
          <span>
            <strong>{videos.length}</strong> vidéo{videos.length > 1 ? "s" : ""}
          </span>
          <span>
            <strong>{visuals.length}</strong> visuel{visuals.length > 1 ? "s" : ""}
          </span>
        </div>

        {total ? (
          <nav className="ac-archive-nav" aria-label="Parcourir les archives">
            <a href="#emissions">Émissions</a>
            <a href="#videos">Vidéos</a>
            <a href="#visuels">Affiches</a>
          </nav>
        ) : null}

        <div className="ac-archive-stack">
          <section id="emissions" className="ac-archive-block">
            <header className="ac-archive-block__head">
              <p className="ac-kicker">01 · Émissions</p>
              <h2>Épisodes archivés</h2>
            </header>
            {shows.length ? (
              <ul className="ac-archive-shows">
                {shows.map((show) => {
                  const guest = show.guests[0]?.guest?.name;
                  const cover = show.poster || show.videoThumbnail;
                  return (
                    <li key={show.id}>
                      <Link href={`/arena-culture/emissions/${show.slug}`} className="ac-archive-card">
                        <div className="ac-archive-card__media">
                          {cover ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={cover} alt="" loading="lazy" />
                          ) : (
                            <div className="ac-archive-card__fallback" />
                          )}
                          {show.videoUrl ? <span className="ac-archive-card__badge">Vidéo</span> : null}
                        </div>
                        <div className="ac-archive-card__body">
                          <p className="ac-kicker">
                            Ép. {String(show.number).padStart(2, "0")}
                            {show.season ? ` · ${show.season.title || `S${show.season.number}`}` : ""}
                          </p>
                          <h3>{show.title}</h3>
                          {guest ? <p className="ac-archive-card__guest">{guest}</p> : null}
                          {show.theme ? <p className="ac-archive-card__theme">{show.theme}</p> : null}
                          {show.airDate ? (
                            <p className="ac-archive-card__date">{formatDate(show.airDate)}</p>
                          ) : null}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState
                title="Aucune émission archivée pour ce filtre"
                description={
                  years.length || seasons.length
                    ? "Modifiez l'année ou la saison, ou revenez à toutes les archives."
                    : "Les archives se remplissent dès qu’une émission quitte la une."
                }
              />
            )}
          </section>

          <section id="videos" className="ac-archive-block">
            <header className="ac-archive-block__head">
              <p className="ac-kicker">02 · Vidéos</p>
              <h2>Anciennes vidéos</h2>
            </header>
            {videos.length ? (
              <div className="ac-archive-videos">
                {videos.map((video) => (
                  <article key={video.id} className="ac-archive-video">
                    <VideoEmbed
                      url={video.url}
                      title={archiveLabel(video.title)}
                      poster={videoPoster(video.url, video.thumbnail)}
                      lazy
                    />
                    <h3>{archiveLabel(video.title)}</h3>
                    {video.arenaShow?.slug ? (
                      <Link
                        href={`/arena-culture/emissions/${video.arenaShow.slug}`}
                        className="ac-archive-video__link"
                      >
                        {video.arenaShow.title}
                      </Link>
                    ) : video.date ? (
                      <p className="ac-archive-card__date">{formatDate(video.date)}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-paper-muted">Pas encore d’ancienne vidéo dans ce filtre.</p>
            )}
          </section>

          <section id="visuels" className="ac-archive-block">
            <header className="ac-archive-block__head">
              <p className="ac-kicker">03 · Affiches & visuels</p>
              <h2>Anciens visuels</h2>
            </header>
            {visuals.length ? (
              <div className="ac-archive-posters">
                {visuals.map((item) => (
                  <figure key={item.id} className="ac-archive-poster">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumbnail || item.url}
                      alt={item.alt || archiveLabel(item.title)}
                      loading="lazy"
                    />
                    <figcaption>{archiveLabel(item.title)}</figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <p className="text-paper-muted">Pas encore d’affiche archivée dans ce filtre.</p>
            )}
          </section>
        </div>
      </section>
    </>
  );
}
