import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ArenaCalendarCard } from "@/components/arena/ArenaCalendarCard";
import { ArenaHero } from "@/components/arena/ArenaHero";
import { ArenaMediaRow } from "@/components/arena/ArenaMediaRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { VideoEmbed } from "@/components/media/VideoEmbed";
import { arenaShowVideo, videoPoster } from "@/lib/media";
import {
  getArenaHome,
  getArenaPhotoAlbums,
  getArenaStage,
  getArchivedShows,
  getFeaturedArenaGuests,
  getGallery,
  getPublishedShows,
  getUpcomingArenaDates,
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
  const [home, stage, shows, posters, featuredGuests, albums, archived, upcoming] = await Promise.all([
    getArenaHome(),
    getArenaStage(),
    getPublishedShows({ take: 8 }),
    getGallery({ category: "ARENA_CULTURE", kind: "IMAGE", take: 8 }),
    getFeaturedArenaGuests(8),
    getArenaPhotoAlbums(),
    getArchivedShows({ take: 8 }),
    getUpcomingArenaDates(),
  ]);

  const headline = stage.headline;
  const spotlight = stage.announced;
  const guest = arenaSpotlightGuest(spotlight);
  const headlineGuest = arenaSpotlightGuest(headline);
  const latest = shows[0];
  const replayTiles = archived
    .filter((show) => show.id !== headline?.id && show.id !== spotlight?.id)
    .map((s) => ({
      href: `/arena-culture/emissions/${s.slug}`,
      title: arenaSpotlightGuest(s)?.name || s.title,
      subtitle: s.theme || `Épisode ${String(s.number).padStart(2, "0")}`,
      image: arenaShowCover(s) || "/artists/fally-ipupa.jpg",
    }));

  const currentShows = shows.filter((s) => s.id !== headline?.id && s.id !== spotlight?.id);
  const showTiles = currentShows.map((s) => ({
    href: `/arena-culture/emissions/${s.slug}`,
    title: arenaSpotlightGuest(s)?.name || s.title,
    subtitle: s.theme || arenaSpotlightGuest(s)?.profession || `Épisode ${String(s.number).padStart(2, "0")}`,
    image: arenaShowCover(s) || "/artists/fally-ipupa.jpg",
  }));

  const posterTiles =
    shows.filter((s) => s.poster).length > 0
      ? shows
          .filter((s) => s.poster)
          .map((s) => ({
            href: `/arena-culture/emissions/${s.slug}`,
            title: s.title,
            image: s.poster as string,
          }))
      : posters.map((p) => ({
          title: p.title,
          image: p.thumbnail || p.url,
        }));

  const photoTiles = albums.slice(0, 6).map((album) => ({
    title: album.guestName || album.title,
    image: album.coverImage || album.photos[0]?.url || "/arena/albums/invitee-plateau/01-invitee.jpg",
    href: `/arena-culture/albums/${album.slug}`,
  }));

  const sceneTiles = featuredGuests.map((guest) => ({
    title: guest.name,
    image: guest.photo || home.hero.poster || "/artists/gaz-mawete.jpg",
    href: `/arena-culture/invites/${guest.slug}`,
  }));
  const heroPoster =
    spotlight?.poster ||
    guest?.photo ||
    home.hero.poster;
  const headlineVideo = headline ? arenaShowVideo(headline) : "";

  return (
    <>
      <ArenaHero
        line1={home.hero.line1}
        line2={home.hero.line2}
        line3={home.hero.line3}
        description={home.hero.text}
        ctaInvites={home.hero.ctaInvites}
        poster={heroPoster}
        spotlightTitle={headlineGuest?.name || headline?.title || guest?.name || spotlight?.title}
        spotlightHref={
          headline
            ? `/arena-culture/emissions/${headline.slug}`
            : spotlight
              ? `/arena-culture/emissions/${spotlight.slug}`
              : latest
                ? `/arena-culture/emissions/${latest.slug}`
                : undefined
        }
        ctaLabel={
          headline
            ? `Nouvelle émission · ${headlineGuest?.name || headline.title}`
            : spotlight
              ? `${home.spotlight.emptyLabel} · ${guest?.name || spotlight.title}`
              : "Voir les émissions"
        }
      />

      {headlineVideo ? (
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

      <ArenaMediaRow
        eyebrow={home.explore.eyebrow}
        title={home.explore.title}
        items={home.explore.items}
        variant="wide"
      />

      <section className="ac-spotlight">
        <div className="ac-spotlight__grid">
          <div className="ac-spotlight__visual">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                spotlight?.poster ||
                guest?.photo ||
                "/arena/albums/invitee-plateau/01-invitee.jpg"
              }
              alt={guest?.name || spotlight?.title || "Invité Arena Culture"}
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="ac-spotlight__copy">
            <p className="ac-kicker">{home.spotlight.emptyLabel}</p>
            {spotlight ? (
              <>
                <p className="ac-spotlight-label">{home.spotlight.emptyLabel}</p>
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
                <p className="ac-spotlight-label">{home.spotlight.emptyLabel}</p>
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

            <div className="ac-chips">
              <Link href="/arena-culture/calendrier" className="ac-chip">
                Dates
              </Link>
              <Link href="#alertes" className="ac-chip">
                Alertes
              </Link>
              <Link href="/arena-culture/emissions" className="ac-chip">
                {home.spotlight.chipShows}
              </Link>
              <Link href="/arena-culture/videos" className="ac-chip">
                {home.spotlight.chipVideos}
              </Link>
              <Link href="/arena-culture/archives" className="ac-chip">
                {home.spotlight.chipArchives}
              </Link>
              <Link href="/contact" className="ac-chip">
                {home.spotlight.chipCollab}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {upcoming.length ? (
        <section className="ac-cal-home">
          <div className="ac-row__head">
            <div>
              <p className="ac-kicker">Agenda</p>
              <h2 className="ac-row__title">Prochaines dates</h2>
            </div>
            <Link href="/arena-culture/calendrier" className="ac-row__more">
              Tout voir
            </Link>
          </div>
          <div className="ac-cal-list">
            {upcoming.slice(0, 3).map((show) => (
              <ArenaCalendarCard key={show.id} show={show} />
            ))}
          </div>
        </section>
      ) : null}

      <ArenaMediaRow
        eyebrow={home.scene.eyebrow}
        title={home.scene.title}
        href="/arena-culture/invites"
        items={sceneTiles}
        variant="poster"
      />

      {showTiles.length ? (
        <ArenaMediaRow
          eyebrow={home.shows.eyebrow}
          title={home.shows.title}
          href="/arena-culture/emissions"
          items={showTiles}
          variant="wide"
        />
      ) : replayTiles.length ? (
        <ArenaMediaRow
          eyebrow="Rediffusions"
          title="Dans les archives"
          href="/arena-culture/archives"
          items={replayTiles}
          variant="wide"
        />
      ) : null}

      {posterTiles.length ? (
        <ArenaMediaRow
          eyebrow={home.posters.eyebrow}
          title={home.posters.title}
          href="/arena-culture/affiches"
          items={posterTiles}
          variant="poster"
        />
      ) : (
        <section className="ac-spotlight">
          <EmptyState title="Affiches à venir" description="Les visuels d'émissions apparaîtront ici." />
        </section>
      )}

      {photoTiles.length ? (
        <ArenaMediaRow
          eyebrow={home.photos.eyebrow}
          title={home.photos.title}
          href="/arena-culture/photos"
          items={photoTiles}
          variant="square"
        />
      ) : null}

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
