import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ArenaHero } from "@/components/arena/ArenaHero";
import { ArenaMediaRow } from "@/components/arena/ArenaMediaRow";
import { VideoEmbed } from "@/components/media/VideoEmbed";
import { arenaShowVideo, videoPoster } from "@/lib/media";
import {
  getArenaHome,
  getArenaPhotoAlbums,
  getArenaStage,
  getFeaturedArenaGuests,
} from "@/lib/data";
import { arenaShowCover, arenaSpotlightGuest } from "@/lib/arena-spotlight";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Arena Culture",
  description:
    "Émissions, invités, affiches, photos, vidéos et archives — l'univers médiatique de KISHA BUZZ.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ArenaCulturePage() {
  await connection();
  const [home, stage, featuredGuests, albums] = await Promise.all([
    getArenaHome(),
    getArenaStage(),
    getFeaturedArenaGuests(8),
    getArenaPhotoAlbums(),
  ]);

  const headline = stage.headline;
  const spotlight = stage.announced;
  const guest = arenaSpotlightGuest(spotlight);
  const headlineGuest = arenaSpotlightGuest(headline);
  const headlineVideo = headline ? arenaShowVideo(headline) : "";
  const heroPoster = spotlight?.poster || guest?.photo || home.hero.poster;

  const sceneTiles = featuredGuests
    .filter((item) => item.photo)
    .map((item) => ({
      title: item.name,
      image: item.photo,
      href: `/arena-culture/invites/${item.slug}`,
    }));

  const photoTiles = albums
    .map((album) => ({
      title: album.guestName || album.title,
      image: album.coverImage || album.photos[0]?.url || "",
      href: `/arena-culture/albums/${album.slug}`,
    }))
    .filter((tile) => tile.image)
    .slice(0, 6);

  const posterTiles = [spotlight, headline]
    .filter((show): show is NonNullable<typeof show> => Boolean(show?.poster))
    .filter((show, index, list) => list.findIndex((item) => item.id === show.id) === index)
    .map((show) => ({
      href: `/arena-culture/emissions/${show.slug}`,
      title: arenaSpotlightGuest(show)?.name || show.title,
      image: arenaShowCover(show) || show.poster,
    }))
    .filter((tile) => tile.image);

  return (
    <>
      <ArenaHero
        line1={home.hero.line1}
        line2={home.hero.line2}
        line3={home.hero.line3}
        description={home.hero.text}
        ctaInvites={home.hero.ctaInvites}
        poster={heroPoster}
        spotlightTitle={headlineGuest?.name || guest?.name}
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

      {headline && headlineVideo ? (
        <section className="ac-page">
          <p className="ac-kicker">Nouvelle émission</p>
          <h2 className="font-display text-3xl md:text-4xl">{headlineGuest?.name || headline.title}</h2>
          {headline.theme || headlineGuest?.profession ? (
            <p className="mt-2 mb-6 text-lg text-paper-muted">
              {headline.theme || headlineGuest?.profession}
            </p>
          ) : (
            <div className="mb-6" />
          )}
          <VideoEmbed
            url={headlineVideo}
            title={headlineGuest?.name || headline.title}
            poster={videoPoster(headlineVideo, headline.videoThumbnail)}
          />
        </section>
      ) : null}

      <section className="ac-spotlight">
        <div className="ac-spotlight__grid">
          {spotlight?.poster || guest?.photo || home.hero.poster ? (
            <div className="ac-spotlight__visual">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={spotlight?.poster || guest?.photo || home.hero.poster}
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
                <h2>
                  {guest ? (
                    <Link href={`/arena-culture/invites/${guest.slug}`}>{guest.name}</Link>
                  ) : (
                    spotlight.title
                  )}
                </h2>
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
        eyebrow={home.scene.eyebrow}
        title={home.scene.title}
        href="/arena-culture/invites"
        items={sceneTiles}
        variant="poster"
      />

      <ArenaMediaRow
        eyebrow={home.photos.eyebrow}
        title="Albums photos"
        href="/arena-culture/photos"
        items={photoTiles}
        variant="square"
      />

      <ArenaMediaRow
        eyebrow={home.posters.eyebrow}
        title={home.posters.title}
        href="/arena-culture/affiches"
        items={posterTiles}
        variant="poster"
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
