import type { Metadata } from "next";
import Link from "next/link";
import {
  Calendar,
  ChevronRight,
  Film,
  Image as ImageIcon,
  Play,
  Tv,
} from "lucide-react";
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
        title="Archives & Mémoire"
        description="Retrouvez toutes les émissions, vidéos exclusives et affiches officielles qui ont marqué l'histoire d'Arena Culture."
      />

      <section className="ac-page">
        {/* Barre de filtres stylée */}
        <div className="mb-8 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-[#121622] via-[#0d1017] to-[#07090e] p-5 backdrop-blur-xl sm:p-6">
          <div className="grid gap-5 md:grid-cols-2">
            {/* Filtre Année */}
            <div>
              <p className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
                <Calendar className="h-3.5 w-3.5" />
                <span>Année</span>
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/arena-culture/archives"
                  className={cn(
                    "rounded-xl px-4 py-2 text-xs font-bold transition-all duration-300 sm:text-sm",
                    !year && !seasonId
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-md shadow-amber-500/20 font-extrabold scale-102"
                      : "border border-white/10 bg-black/40 text-white/70 hover:border-amber-400/40 hover:text-white"
                  )}
                >
                  Toutes
                </Link>
                {years.map((y) => (
                  <Link
                    key={y}
                    href={`/arena-culture/archives?annee=${y}`}
                    className={cn(
                      "rounded-xl px-4 py-2 text-xs font-bold transition-all duration-300 sm:text-sm",
                      year === y
                        ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-md shadow-amber-500/20 font-extrabold scale-102"
                        : "border border-white/10 bg-black/40 text-white/70 hover:border-amber-400/40 hover:text-white"
                    )}
                  >
                    {y}
                  </Link>
                ))}
              </div>
            </div>

            {/* Filtre Saison */}
            {seasons.length ? (
              <div>
                <p className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
                  <Tv className="h-3.5 w-3.5" />
                  <span>Saisons</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {seasons.map((s) => (
                    <Link
                      key={s.id}
                      href={`/arena-culture/archives?saison=${s.id}`}
                      className={cn(
                        "rounded-xl px-4 py-2 text-xs font-bold transition-all duration-300 sm:text-sm",
                        seasonId === s.id
                          ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-md shadow-amber-500/20 font-extrabold scale-102"
                          : "border border-white/10 bg-black/40 text-white/70 hover:border-amber-400/40 hover:text-white"
                      )}
                    >
                      {s.title || `Saison ${s.number}`} ({s.year})
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Compteurs / Stats */}
        <div className="mb-6 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#10141f] px-3.5 py-2">
            <Tv className="h-4 w-4 text-amber-400" />
            <span className="text-white/60">Émissions :</span>
            <strong className="font-bold text-white">{shows.length}</strong>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#10141f] px-3.5 py-2">
            <Film className="h-4 w-4 text-amber-400" />
            <span className="text-white/60">Vidéos :</span>
            <strong className="font-bold text-white">{videos.length}</strong>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#10141f] px-3.5 py-2">
            <ImageIcon className="h-4 w-4 text-amber-400" />
            <span className="text-white/60">Affiches :</span>
            <strong className="font-bold text-white">{visuals.length}</strong>
          </div>
        </div>

        {/* Navigation d'ancrage */}
        {total ? (
          <nav className="sticky top-28 z-30 mb-10 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-[#07090e]/90 p-2 backdrop-blur-xl" aria-label="Parcourir les archives">
            <a
              href="#emissions"
              className="inline-flex items-center gap-1.5 rounded-xl border border-transparent px-4 py-2 text-xs font-bold text-white/80 transition-all hover:border-amber-400/30 hover:bg-amber-400/10 hover:text-amber-300"
            >
              <Tv className="h-3.5 w-3.5 text-amber-400" />
              <span>Émissions ({shows.length})</span>
            </a>
            <a
              href="#videos"
              className="inline-flex items-center gap-1.5 rounded-xl border border-transparent px-4 py-2 text-xs font-bold text-white/80 transition-all hover:border-amber-400/30 hover:bg-amber-400/10 hover:text-amber-300"
            >
              <Film className="h-3.5 w-3.5 text-amber-400" />
              <span>Vidéos ({videos.length})</span>
            </a>
            <a
              href="#visuels"
              className="inline-flex items-center gap-1.5 rounded-xl border border-transparent px-4 py-2 text-xs font-bold text-white/80 transition-all hover:border-amber-400/30 hover:bg-amber-400/10 hover:text-amber-300"
            >
              <ImageIcon className="h-3.5 w-3.5 text-amber-400" />
              <span>Affiches ({visuals.length})</span>
            </a>
          </nav>
        ) : null}

        <div className="grid gap-16">
          {/* Section 01 : Émissions */}
          <section id="emissions" className="scroll-mt-36">
            <header className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-400">01 · Émissions</p>
                <h2 className="mt-1 font-display text-2xl font-extrabold text-white sm:text-3xl">
                  Épisodes archivés
                </h2>
              </div>
            </header>

            {shows.length ? (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {shows.map((show) => {
                  const guest = show.guests[0]?.guest?.name;
                  const cover = show.poster || show.videoThumbnail;
                  return (
                    <li key={show.id}>
                      <Link
                        href={`/arena-culture/emissions/${show.slug}`}
                        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#121624] to-[#0a0d15] transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/50 hover:shadow-[0_12px_30px_rgba(245,158,11,0.15)]"
                      >
                        <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/60">
                          {cover ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={cover}
                              alt=""
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-950/40 to-black">
                              <Tv className="h-10 w-10 text-amber-500/40" />
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                          {show.videoUrl ? (
                            <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-md bg-amber-500 px-2 py-1 text-[0.65rem] font-black uppercase tracking-wider text-black shadow">
                              <Play className="h-2.5 w-2.5 fill-black" />
                              Vidéo
                            </span>
                          ) : null}

                          <span className="absolute top-2.5 left-2.5 rounded-md border border-white/20 bg-black/60 px-2 py-0.5 text-[0.7rem] font-extrabold text-amber-300 backdrop-blur-md">
                            Ép. {String(show.number).padStart(2, "0")}
                          </span>
                        </div>

                        <div className="flex flex-1 flex-col p-4">
                          <p className="text-[0.75rem] font-bold text-white/50">
                            {show.season ? show.season.title || `Saison ${show.season.number}` : "Hors-saison"}
                            {show.airDate ? ` · ${formatDate(show.airDate)}` : ""}
                          </p>

                          <h3 className="mt-1 font-display text-base font-bold text-white transition-colors group-hover:text-amber-300">
                            {show.title}
                          </h3>

                          {guest ? (
                            <p className="mt-1 text-xs font-semibold text-amber-400/90">
                              Invité : {guest}
                            </p>
                          ) : null}

                          {show.theme ? (
                            <p className="mt-2 line-clamp-2 text-xs text-white/60">
                              {show.theme}
                            </p>
                          ) : null}

                          <div className="mt-auto pt-4 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:text-amber-300">
                            <span>Voir la fiche</span>
                            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </div>
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
                    ? "Modifiez l'année ou la saison sélectionnée pour voir les archives."
                    : "Les archives se remplissent dès qu’une émission quitte la une."
                }
              />
            )}
          </section>

          {/* Section 02 : Vidéos */}
          <section id="videos" className="scroll-mt-36">
            <header className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-400">02 · Vidéos</p>
                <h2 className="mt-1 font-display text-2xl font-extrabold text-white sm:text-3xl">
                  Anciennes vidéos
                </h2>
              </div>
            </header>

            {videos.length ? (
              <div className="grid gap-6 md:grid-cols-2">
                {videos.map((video) => (
                  <article
                    key={video.id}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-[#121624] p-4 transition-all duration-300 hover:border-amber-400/40"
                  >
                    <div className="overflow-hidden rounded-xl">
                      <VideoEmbed
                        url={video.url}
                        title={archiveLabel(video.title)}
                        poster={videoPoster(video.url, video.thumbnail)}
                        lazy
                      />
                    </div>
                    <h3 className="mt-3.5 font-display text-base font-bold text-white">
                      {archiveLabel(video.title)}
                    </h3>
                    {video.arenaShow?.slug ? (
                      <Link
                        href={`/arena-culture/emissions/${video.arenaShow.slug}`}
                        className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:underline"
                      >
                        <span>Émission liée : {video.arenaShow.title}</span>
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    ) : video.date ? (
                      <p className="mt-1 text-xs text-white/50">{formatDate(video.date)}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/5 bg-[#0a0d15] p-8 text-center text-sm text-white/50">
                Pas encore d’ancienne vidéo dans ce filtre.
              </div>
            )}
          </section>

          {/* Section 03 : Affiches & Visuels */}
          <section id="visuels" className="scroll-mt-36">
            <header className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-400">03 · Affiches &amp; Visuels</p>
                <h2 className="mt-1 font-display text-2xl font-extrabold text-white sm:text-3xl">
                  Anciens visuels
                </h2>
              </div>
            </header>

            {visuals.length ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {visuals.map((item) => (
                  <figure
                    key={item.id}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#121624] transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/50 hover:shadow-lg"
                  >
                    <div className="aspect-[3/4] w-full overflow-hidden bg-black/60">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.thumbnail || item.url}
                        alt={item.alt || archiveLabel(item.title)}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <figcaption className="p-3 text-center text-xs font-bold text-white transition-colors group-hover:text-amber-300">
                      {archiveLabel(item.title)}
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/5 bg-[#0a0d15] p-8 text-center text-sm text-white/50">
                Pas encore d’affiche archivée dans ce filtre.
              </div>
            )}
          </section>
        </div>
      </section>
    </>
  );
}
