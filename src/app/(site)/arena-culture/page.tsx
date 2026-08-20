import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ArenaCalendarCard } from "@/components/arena/ArenaCalendarCard";
import { ArenaHero } from "@/components/arena/ArenaHero";
import { ArenaMediaRow } from "@/components/arena/ArenaMediaRow";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  getArenaHome,
  getArenaPhotoAlbums,
  getArenaSpotlight,
  getArchivedShows,
  getFeaturedArenaGuests,
  getGallery,
  getPublishedShows,
  getUpcomingArenaDates,
} from "@/lib/data";
import { arenaSpotlightMode } from "@/lib/arena-spotlight";
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
  const [home, spotlight, shows, posters, featuredGuests, albums, archived, upcoming] = await Promise.all([
    getArenaHome(),
    getArenaSpotlight(),
    getPublishedShows({ take: 8 }),
    getGallery({ category: "ARENA_CULTURE", kind: "IMAGE", take: 8 }),
    getFeaturedArenaGuests(8),
    getArenaPhotoAlbums(),
    getArchivedShows({ take: 8 }),
    getUpcomingArenaDates(),
  ]);

  const guest = spotlight?.guests.map((item) => item.guest).find((item) => item.visible !== false);
  const mode = arenaSpotlightMode(spotlight);
  const latest = shows[0];
  const replayTiles = archived
    .filter((show) => show.id !== spotlight?.id)
    .map((s) => ({
      href: `/arena-culture/emissions/${s.slug}`,
      title: s.title,
      subtitle: s.theme || `Épisode ${String(s.number).padStart(2, "0")}`,
      image: s.poster || "/artists/fally-ipupa.jpg",
    }));

  const currentShows = shows.filter((s) => s.id !== spotlight?.id);
  const showTiles = currentShows.map((s) => ({
    href: `/arena-culture/emissions/${s.slug}`,
    title: s.title,
    subtitle: s.theme || `Épisode ${String(s.number).padStart(2, "0")}`,
    image: s.poster || "/artists/fally-ipupa.jpg",
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
    mode === "empty"
      ? home.hero.poster
      : spotlight?.poster || guest?.photo || home.hero.poster;

  return (
    <>
      <ArenaHero
        line1={home.hero.line1}
        line2={home.hero.line2}
        line3={home.hero.line3}
        description={home.hero.text}
        ctaInvites={home.hero.ctaInvites}
        poster={heroPoster}
        spotlightTitle={guest?.name || spotlight?.title}
        spotlightHref={
          spotlight
            ? `/arena-culture/emissions/${spotlight.slug}`
            : latest
              ? `/arena-culture/emissions/${latest.slug}`
              : undefined
        }
        ctaLabel={
          mode === "announced"
            ? `Prochain · ${guest?.name || spotlight?.title}`
            : mode === "headline"
              ? `À la une · ${guest?.name || spotlight?.title}`
              : "Voir les émissions"
        }
      />

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
                heroPoster ||
                "/arena/albums/invitee-plateau/01-invitee.jpg"
              }
              alt={guest?.name || spotlight?.title || "Invité Arena Culture"}
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="ac-spotlight__copy">
            <p className="ac-kicker">À la une</p>
            {mode === "headline" && spotlight ? (
              <>
                <p className="ac-spotlight-label">Invité de la semaine</p>
                <h2>
                  {guest ? (
                    <Link href={`/arena-culture/invites/${guest.slug}`}>{guest.name}</Link>
                  ) : (
                    spotlight.title
                  )}
                </h2>
                <p>
                  {[guest?.profession, spotlight.theme].filter(Boolean).join(" · ") ||
                    "Invité Arena Grand Culture."}
                  {spotlight.airDate
                    ? ` — ${formatDate(spotlight.airDate)}${spotlight.airTime ? ` · ${spotlight.airTime}` : ""}`
                    : ""}
                </p>
                <div className="ac-spotlight__actions">
                  <Link
                    href={`/arena-culture/emissions/${spotlight.slug}`}
                    className="ac-btn ac-btn--primary"
                  >
                    {spotlight.videoUrl ? "Voir la vidéo" : "Voir l'émission"}
                  </Link>
                  <Link href={guest ? `/arena-culture/invites/${guest.slug}` : "/arena-culture/invites"} className="ac-btn ac-btn--ghost">
                    {guest ? "Fiche invité" : home.hero.ctaInvites}
                  </Link>
                </div>
              </>
            ) : mode === "announced" && spotlight ? (
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
