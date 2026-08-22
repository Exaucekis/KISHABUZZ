import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
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

      <section className="ac-close">
        <p className="ac-kicker">{home.memory.eyebrow}</p>
        <h2>{home.memory.title}</h2>
        <p>{home.memory.body}</p>
        <div className="ac-close__actions">
          <Link href="/arena-culture/archives" className="ac-btn ac-btn--primary">
            {home.memory.cta}
          </Link>
          <Link href="/contact" className="ac-btn ac-btn--ghost">
            {home.memory.secondary}
          </Link>
        </div>
      </section>
    </>
  );
}
