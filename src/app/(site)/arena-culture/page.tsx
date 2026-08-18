import type { Metadata } from "next";
import Link from "next/link";
import { ArenaHero } from "@/components/arena/ArenaHero";
import { ArenaMediaRow } from "@/components/arena/ArenaMediaRow";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  getArenaPhotoAlbums,
  getFeaturedArenaGuests,
  getGallery,
  getGuestOfTheWeek,
  getPageContent,
  getPublishedShows,
  getUpcomingShow,
} from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Arena Culture",
  description:
    "Émissions, invités, affiches, photos, vidéos et archives — l'univers médiatique de KISHA BUZZ.",
};

const EXPLORE = [
  {
    href: "/arena-culture/emissions",
    title: "Émissions",
    subtitle: "Épisodes & replays",
    image: "/artists/fally-ipupa.jpg",
  },
  {
    href: "/arena-culture/invites",
    title: "Invités",
    subtitle: "Talents & voix",
    image: "/artists/gaz-mawete.jpg",
  },
  {
    href: "/arena-culture/affiches",
    title: "Affiches",
    subtitle: "Visuels officiels",
    image: "/artists/koffi-olomide.jpg",
  },
  {
    href: "/arena-culture/photos",
    title: "Photos",
    subtitle: "Plateaux & coulisses",
    image: "/artists/ferre-gola.jpg",
  },
  {
    href: "/arena-culture/videos",
    title: "Vidéos",
    subtitle: "Extraits",
    image: "/artists/innoss-b.png",
  },
  {
    href: "/arena-culture/archives",
    title: "Archives",
    subtitle: "Saisons passées",
    image: "/artists/damso.jpg",
  },
];

const SCENE = [
  { title: "Gaz Mawete", image: "/artists/gaz-mawete.jpg", href: "/arena-culture/invites" },
  { title: "Fally Ipupa", image: "/artists/fally-ipupa.jpg", href: "/arena-culture/invites" },
  { title: "Innoss'B", image: "/artists/innoss-b.png", href: "/arena-culture/invites" },
  { title: "Koffi Olomidé", image: "/artists/koffi-olomide.jpg", href: "/arena-culture/invites" },
  { title: "Ferré Gola", image: "/artists/ferre-gola.jpg", href: "/arena-culture/invites" },
  { title: "Damso", image: "/artists/damso.jpg", href: "/arena-culture/invites" },
];

export default async function ArenaCulturePage() {
  const [presentation, guestWeek, upcoming, shows, posters, featuredGuests, albums] = await Promise.all([
    getPageContent("arena.presentation"),
    getGuestOfTheWeek(),
    getUpcomingShow(),
    getPublishedShows({ take: 8 }),
    getGallery({ category: "ARENA_CULTURE", kind: "IMAGE", take: 8 }),
    getFeaturedArenaGuests(8),
    getArenaPhotoAlbums(),
  ]);

  const guest = guestWeek?.guests.map((item) => item.guest).find((item) => item.visible !== false);
  const latest = shows[0];
  const upcomingGuest = upcoming?.guests.map((item) => item.guest).find((item) => item.visible !== false);
  const copy =
    presentation?.body ||
    "Émissions, invités, images et archives — l'univers culturel de KISHA BUZZ.";

  const showTiles = shows.map((s) => ({
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

  const sceneTiles = featuredGuests.length
    ? featuredGuests.map((guest) => ({
        title: guest.name,
        image: guest.photo || "/artists/gaz-mawete.jpg",
        href: `/arena-culture/invites/${guest.slug}`,
      }))
    : SCENE;

  return (
    <>
      <ArenaHero
        description={copy}
        spotlightTitle={guest?.name || upcoming?.guests[0]?.guest.name || latest?.title}
        spotlightHref={
          guestWeek
            ? `/arena-culture/emissions/${guestWeek.slug}`
            : upcoming
              ? `/arena-culture/emissions/${upcoming.slug}`
              : latest
                ? `/arena-culture/emissions/${latest.slug}`
                : undefined
        }
      />

      <ArenaMediaRow
        eyebrow="Explorer"
        title="Univers Arena"
        items={EXPLORE}
        variant="wide"
      />

      <section className="ac-spotlight">
        <div className="ac-spotlight__grid">
          <div className="ac-spotlight__visual">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                guestWeek?.poster ||
                guest?.photo ||
                upcoming?.poster ||
                "/arena/albums/invitee-plateau/01-invitee.jpg"
              }
              alt={guest?.name || upcoming?.title || "Invité Arena Culture"}
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="ac-spotlight__copy">
            <p className="ac-kicker">À la une</p>
            {guestWeek && guest ? (
              <>
                <p className="ac-spotlight-label">
                  {guestWeek.airDate && guestWeek.airDate > new Date()
                    ? "Prochain invité"
                    : "Invité de la semaine"}
                </p>
                <h2>
                  <Link href={`/arena-culture/invites/${guest.slug}`}>{guest.name}</Link>
                </h2>
                <p>
                  {[guest.profession, guestWeek.theme].filter(Boolean).join(" · ") ||
                    "Invité Arena Grand Culture."}
                  {guestWeek.airDate
                    ? ` — ${formatDate(guestWeek.airDate)}${guestWeek.airTime ? ` · ${guestWeek.airTime}` : ""}`
                    : ""}
                </p>
                <div className="ac-spotlight__actions">
                  <Link
                    href={`/arena-culture/emissions/${guestWeek.slug}`}
                    className="ac-btn ac-btn--primary"
                  >
                    Voir l&apos;émission
                  </Link>
                  <Link href={`/arena-culture/invites/${guest.slug}`} className="ac-btn ac-btn--ghost">
                    Fiche invité
                  </Link>
                </div>
              </>
            ) : upcoming ? (
              <>
                <p className="ac-spotlight-label">Prochain invité</p>
                <h2>{upcomingGuest?.name || upcoming.title}</h2>
                <p>
                  {[upcoming.theme, upcomingGuest?.profession]
                    .filter(Boolean)
                    .join(" · ") || upcoming.title}
                  {upcoming.airDate
                    ? ` — ${formatDate(upcoming.airDate)}${upcoming.airTime ? ` · ${upcoming.airTime}` : ""}`
                    : ""}
                </p>
                <div className="ac-spotlight__actions">
                  <Link
                    href={`/arena-culture/emissions/${upcoming.slug}`}
                    className="ac-btn ac-btn--primary"
                  >
                    Voir l&apos;affiche
                  </Link>
                  <Link href="/arena-culture/affiches" className="ac-btn ac-btn--ghost">
                    Affiches
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="ac-spotlight-label">Prochain invité</p>
                <h2>Bientôt annoncé</h2>
                <p>
                  L&apos;invité de la semaine sera annoncé ici. Propose une collaboration ou explore
                  la scène.
                </p>
                <div className="ac-spotlight__actions">
                  <Link href="/contact" className="ac-btn ac-btn--primary">
                    Proposer un invité
                  </Link>
                  <Link href="/arena-culture/emissions" className="ac-btn ac-btn--ghost">
                    Émissions
                  </Link>
                </div>
              </>
            )}

            <div className="ac-chips">
              <Link href="/arena-culture/emissions" className="ac-chip">
                Émissions
              </Link>
              <Link href="/arena-culture/videos" className="ac-chip">
                Vidéos
              </Link>
              <Link href="/arena-culture/archives" className="ac-chip">
                Archives
              </Link>
              <Link href="/contact" className="ac-chip">
                Collaborer
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ArenaMediaRow
        eyebrow="Scène"
        title="Visages & voix"
        href="/arena-culture/invites"
        items={sceneTiles}
        variant="poster"
      />

      {showTiles.length ? (
        <ArenaMediaRow
          eyebrow="Émissions"
          title="À (re)découvrir"
          href="/arena-culture/emissions"
          items={showTiles}
          variant="wide"
        />
      ) : null}

      {posterTiles.length ? (
        <ArenaMediaRow
          eyebrow="Affiches"
          title="Visuels"
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
          eyebrow="Photos"
          title="Ambiances"
          href="/arena-culture/photos"
          items={photoTiles}
          variant="square"
        />
      ) : null}

      <section className="ac-close">
        <p className="ac-kicker">Archives</p>
        <h2>La mémoire de l&apos;Arena</h2>
        <p>Retrouve les saisons et épisodes déjà diffusés.</p>
        <div className="ac-close__actions">
          <Link href="/arena-culture/archives" className="ac-btn ac-btn--primary">
            Ouvrir les archives
          </Link>
          <Link href="/contact" className="ac-btn ac-btn--ghost">
            Collaborer
          </Link>
        </div>
      </section>
    </>
  );
}
