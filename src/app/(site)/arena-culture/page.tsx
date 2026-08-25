import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Archive, ArrowRight, Handshake, Play, Sparkles } from "lucide-react";
import { ArenaHero } from "@/components/arena/ArenaHero";
import { ArenaMediaRow } from "@/components/arena/ArenaMediaRow";

import {
  getArenaHome,
  getArenaPhotoAlbums,
  getArenaStage,
} from "@/lib/data";
import { arenaSpotlightGuest } from "@/lib/arena-spotlight";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Arena Culture",
  description:
    "Émissions, photos et archives — l'univers médiatique de KISHA BUZZ.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ArenaCulturePage() {
  await connection();
  const [home, stage, albums] = await Promise.all([
    getArenaHome(),
    getArenaStage(),
    getArenaPhotoAlbums(),
  ]);

  const headline = stage.headline;
  const spotlight = stage.announced;
  const guest = arenaSpotlightGuest(spotlight);
  const headlineGuest = arenaSpotlightGuest(headline);

  const heroPoster = home.hero.poster;

  const photoTiles = albums
    .map((album) => ({
      title: album.guestName || album.title,
      image: album.coverImage || album.photos[0]?.url || "",
      href: `/arena-culture/albums/${album.slug}`,
    }))
    .filter((tile) => tile.image)
    .slice(0, 6);

  return (
    <>
      <ArenaHero
        line1={home.hero.line1}
        line2={home.hero.line2}
        line3={home.hero.line3}
        description={home.hero.text}
        poster={heroPoster}
        spotlightTitle={headlineGuest?.name ?? guest?.name ?? undefined}
        spotlightHref={
          headline
            ? `/arena-culture/emissions/${headline.slug}`
            : spotlight
              ? `/arena-culture/emissions/${spotlight.slug}`
              : "/arena-culture/emissions"
        }
        ctaLabel={
          headline
            ? `Nouvelle émission · ${headlineGuest?.name || headline.title}`
            : spotlight
              ? `${home.spotlight.emptyLabel} · ${guest?.name || spotlight.title}`
              : "Voir les émissions"
        }
      />

      <section className="ac-spotlight">
        <div className="ac-spotlight__grid">
          {spotlight?.poster || guest?.photo ? (
            <div className="ac-spotlight__visual">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={spotlight?.poster || guest?.photo || undefined}
                alt={guest?.name || spotlight?.title || "Prochain invité Arena Culture"}
                loading="lazy"
                decoding="async"
              />
            </div>
          ) : null}
          <div className="ac-spotlight__copy">
            <p className="ac-kicker">{home.spotlight.emptyLabel}</p>
            {spotlight ? (
              <>
                <h2>{guest?.name || spotlight.title}</h2>
                <p>
                  {[spotlight.theme, guest?.profession].filter(Boolean).join(" · ") ||
                    "Bientôt sur le plateau Arena Grand Culture."}
                  {spotlight.airDate
                    ? ` — ${formatDate(spotlight.airDate)}${spotlight.airTime ? ` · ${spotlight.airTime}` : ""}`
                    : ""}
                </p>
                <div className="ac-spotlight__actions">
                  <Link
                    href={`/arena-culture/emissions/${spotlight.slug}`}
                    className="ac-btn ac-btn--primary"
                  >
                    Voir l&apos;affiche
                  </Link>
                  <Link href="/arena-culture/emissions" className="ac-btn ac-btn--ghost">
                    {home.spotlight.emptySecondary}
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2>{home.spotlight.emptyTitle}</h2>
                <p>{home.spotlight.emptyBody}</p>
                <div className="ac-spotlight__actions">
                  <Link href="/contact" className="ac-btn ac-btn--primary">
                    {home.spotlight.emptyCta}
                  </Link>
                  <Link href="/arena-culture/emissions" className="ac-btn ac-btn--ghost">
                    {home.spotlight.emptySecondary}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <ArenaMediaRow
        eyebrow="Galerie"
        title={home.photos.title}
        href="/arena-culture/photos"
        items={photoTiles}
        variant="square"
      />

      {/* Section Mémoire & Archives Redessinée Ultra-Premium */}
      <section className="relative my-16 overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-b from-[#121624] via-[#0d101a] to-[#060810] p-8 text-center shadow-2xl sm:p-12 md:p-16">
        {/* Glow ambiant */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-96 rounded-full bg-amber-500/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 backdrop-blur-md">
            <Archive className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              {home.memory.eyebrow || "Archives"}
            </span>
          </div>

          <h2 className="mt-4 font-display text-3xl font-extrabold text-white sm:text-4xl md:text-5xl">
            {home.memory.title || "La mémoire de l'Arena"}
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            {home.memory.body || "Retrouvez l’ensemble des saisons, épisodes, visuels et grands moments déjà diffusés sur le plateau."}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/arena-culture/archives"
              className="group inline-flex items-center gap-2.5 rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-7 py-3.5 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-amber-500/25 transition-all hover:scale-105 hover:shadow-amber-500/40 sm:text-sm"
            >
              <Archive className="h-4 w-4 fill-black text-black transition-transform group-hover:scale-110" />
              <span>{home.memory.cta || "Ouvrir les archives"}</span>
              <ArrowRight className="h-4 w-4 text-black transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-xl border border-white/20 bg-black/40 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md transition-all hover:border-amber-400/40 hover:bg-white/10 hover:text-amber-300 sm:text-sm"
            >
              <Handshake className="h-4 w-4 text-amber-400 transition-transform group-hover:scale-110" />
              <span>{home.memory.secondary || "Collaborer"}</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
