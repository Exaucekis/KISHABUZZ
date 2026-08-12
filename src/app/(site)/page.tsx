import Link from "next/link";
import dynamic from "next/dynamic";
import { ArticleCard } from "@/components/content/ArticleCard";
import { DomainMarquee } from "@/components/home/DomainMarquee";
import { HomeHero } from "@/components/home/HomeHero";
import { RevealOnScroll } from "@/components/home/RevealOnScroll";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VideoEmbed } from "@/components/media/VideoEmbed";
import {
  getArenaPhotoAlbums,
  getGallery,
  getGuestOfTheWeek,
  getPageContent,
  getPublishedArticles,
  getPublishedShows,
  getSettings,
  getVisibleDomains,
  getVisiblePartners,
  getPortfolio,
} from "@/lib/data";
import { formatDate } from "@/lib/utils";

const ArtistRail = dynamic(
  () => import("@/components/home/ArtistRail").then((m) => m.ArtistRail),
  { ssr: true }
);

export default async function HomePage() {
  const [
    settings,
    chroniques,
    publications,
    shows,
    guestWeek,
    portfolio,
    partners,
    domains,
    about,
    albums,
    arenaVideos,
  ] = await Promise.all([
    getSettings(),
    getPublishedArticles({ contentType: "CHRONIQUE", take: 4 }),
    getPublishedArticles({ take: 8 }),
    getPublishedShows({ take: 4 }),
    getGuestOfTheWeek(),
    getPortfolio({ take: 3 }),
    getVisiblePartners(),
    getVisibleDomains(),
    getPageContent("about.qui"),
    getArenaPhotoAlbums(),
    getGallery({ kind: "VIDEO", category: "ARENA_CULTURE", take: 1 }),
  ]);

  const guest = guestWeek?.guests[0]?.guest;
  const feed = [...chroniques, ...publications]
    .filter((a, i, arr) => arr.findIndex((x) => x.id === a.id) === i)
    .slice(0, 6);
  const featuredAlbum = albums[0];
  const featuredVideo = arenaVideos[0];
  const spotlightShow = guestWeek || shows[0];
  const spotlightPoster =
    guestWeek?.poster ||
    guest?.photo ||
    shows[0]?.poster ||
    featuredAlbum?.coverImage ||
    "/arena/albums/invitee-plateau/01-invitee.jpg";

  const arenaEntries = [
    {
      href: "/arena-culture/emissions",
      title: "Émissions",
      text: "Épisodes & replays",
      image: shows[0]?.poster || "/arena/posters/terminusboy-14-aout-2026.jpg",
    },
    {
      href: "/arena-culture/photos",
      title: "Albums photos",
      text: "Plateaux & invités",
      image: featuredAlbum?.coverImage || "/arena/albums/invitee-plateau/01-invitee.jpg",
    },
    {
      href: "/arena-culture/videos",
      title: "Vidéos",
      text: "Extraits & moments",
      image: "/arena/albums/invitee-plateau/03-plateau-wide.jpg",
    },
    {
      href: "/arena-culture/affiches",
      title: "Affiches",
      text: "Visuels officiels",
      image: "/arena/posters/terminusboy-14-aout-2026.jpg",
    },
  ];

  return (
    <>
      <HomeHero tagline={settings.tagline} />

      <DomainMarquee items={domains.map((d) => d.name)} />

      <ArtistRail />

      {/* ——— Arena à la une (visuel fort) ——— */}
      <section className="home-spotlight relative overflow-hidden border-y border-line">
        <div className="home-spotlight__bg" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={spotlightPoster} alt="" />
        </div>
        <div className="home-spotlight__shade" aria-hidden />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 py-20 md:grid-cols-[1.05fr_0.95fr] md:items-end md:px-6 md:py-28">
          <RevealOnScroll>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#ffb347]">
              Arena Culture · À la une
            </p>
            <h2 className="mt-4 font-display text-4xl uppercase leading-[0.95] text-white md:text-6xl lg:text-7xl">
              {guest?.name || spotlightShow?.title || "La scène continue"}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
              {guestWeek?.theme ||
                guest?.profession ||
                "Émissions, invités, photos et vidéos — l’univers Arena Grand Culture."}
              {guestWeek?.airDate
                ? ` · ${formatDate(guestWeek.airDate)}${guestWeek.airTime ? ` · ${guestWeek.airTime}` : ""}`
                : ""}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink
                href={
                  guestWeek
                    ? `/arena-culture/emissions/${guestWeek.slug}`
                    : "/arena-culture"
                }
                className="!bg-[#ff8c00] !text-black hover:!bg-[#ff9f2e]"
              >
                Voir l&apos;affiche
              </ButtonLink>
              <ButtonLink
                href="/arena-culture"
                variant="secondary"
                className="!border-white/45 !text-white hover:!bg-white/10"
              >
                Entrer dans Arena
              </ButtonLink>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={140}>
            <div className="home-spotlight__poster">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={spotlightPoster}
                alt={guest?.name || spotlightShow?.title || "Arena Culture"}
                loading="lazy"
                decoding="async"
              />
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ——— Univers Arena (4 portes d’entrée) ——— */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28">
        <RevealOnScroll>
          <SectionHeading
            eyebrow="Arena Culture"
            title="Un univers à explorer"
            description="Tout le contenu image et plateau vit dans Arena Culture — émissions, albums, vidéos et affiches."
          />
        </RevealOnScroll>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {arenaEntries.map((item, i) => (
            <RevealOnScroll key={item.href} delay={i * 70}>
              <Link href={item.href} className="home-door focus-ring group">
                <div className="home-door__media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt="" loading="lazy" decoding="async" />
                </div>
                <div className="home-door__copy">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* ——— Vidéo Arena ——— */}
      {featuredVideo ? (
        <section className="mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28">
          <RevealOnScroll>
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                eyebrow="Arena · Vidéo"
                title={featuredVideo.title}
                description={featuredVideo.description || "Extrait vidéo Arena Culture."}
              />
              <Link
                href="/arena-culture/videos"
                className="shrink-0 text-sm font-semibold text-ember-text"
              >
                Toutes les vidéos →
              </Link>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={100}>
            <div className="home-video">
              <VideoEmbed url={featuredVideo.url} title={featuredVideo.title} />
            </div>
          </RevealOnScroll>
        </section>
      ) : null}

      {/* ——— Actualités ——— */}
      <section id="actualites" className="border-y border-line bg-ink-2">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28">
          <RevealOnScroll>
            <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                eyebrow="Actualités"
                title="Chroniques & publications"
                description="Scène, culture et contenus signés KISHA BUZZ."
              />
              <Link href="/publications" className="shrink-0 text-sm font-semibold text-ember-text">
                Tout voir →
              </Link>
            </div>
          </RevealOnScroll>
          {feed.length ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {feed.map((article, i) => (
                <RevealOnScroll key={article.id} delay={i * 70}>
                  <ArticleCard
                    href={
                      article.contentType === "CHRONIQUE"
                        ? `/chroniques/${article.slug}`
                        : `/publications/${article.slug}`
                    }
                    title={article.title}
                    excerpt={article.excerpt}
                    coverImage={article.coverImage}
                    category={article.category?.name}
                    date={article.publishedAt}
                    author={article.authorName}
                  />
                </RevealOnScroll>
              ))}
            </div>
          ) : (
            <RevealOnScroll>
              <EmptyState
                title="Contenus à venir"
                description="Les chroniques et publications seront disponibles dès leur publication."
                action={<ButtonLink href="/contact">Proposer une collaboration</ButtonLink>}
              />
            </RevealOnScroll>
          )}
        </div>
      </section>

      {/* ——— Portfolio seulement s’il y a du contenu ——— */}
      {portfolio.length ? (
        <section className="mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28">
          <RevealOnScroll>
            <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                eyebrow="Portfolio"
                title="Portfolio média"
                description="Reportages, interviews, couvertures d'événements et productions."
              />
              <Link href="/portfolio" className="shrink-0 text-sm font-semibold text-ember-text">
                Explorer →
              </Link>
            </div>
          </RevealOnScroll>
          <div className="grid gap-5 md:grid-cols-2">
            {portfolio.map((item, i) => (
              <RevealOnScroll key={item.id} delay={i * 90}>
                <Link
                  href={`/portfolio/${item.slug}`}
                  className="group block border-b border-line py-6 transition hover:border-ember focus-ring"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-ember-text">{item.type}</p>
                  <h3 className="mt-3 font-display text-2xl transition group-hover:text-ember-text md:text-3xl">
                    {item.title}
                  </h3>
                  {item.description ? (
                    <p className="mt-3 line-clamp-2 text-sm text-paper-muted">{item.description}</p>
                  ) : null}
                </Link>
              </RevealOnScroll>
            ))}
          </div>
        </section>
      ) : null}

      {/* ——— Partenaires seulement s’il y a du contenu ——— */}
      {partners.length ? (
        <section className="mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28">
          <RevealOnScroll>
            <SectionHeading
              eyebrow="Collaborations"
              title="Partenaires & collaborations"
              description="Les partenaires officiels de KISHA BUZZ."
            />
          </RevealOnScroll>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 md:grid-cols-3">
            {partners.map((p, i) => (
              <RevealOnScroll key={p.id} delay={i * 80}>
                <div className="border-t border-ember/40 pt-5">
                  <h3 className="font-display text-xl">{p.name}</h3>
                  {p.description ? (
                    <p className="mt-2 text-sm text-paper-muted">{p.description}</p>
                  ) : null}
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </section>
      ) : null}

      <section className="border-y border-line">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 md:grid-cols-2 md:px-6 md:py-28">
          <RevealOnScroll>
            <SectionHeading
              eyebrow="À propos"
              title={about?.title || "Qui sommes-nous ?"}
              description={about?.body || settings.aboutShort}
            />
            <div className="mt-8">
              <ButtonLink href="/a-propos" variant="secondary">
                Lire le profil
              </ButtonLink>
            </div>
          </RevealOnScroll>
          <div className="grid grid-cols-2 gap-3">
            {domains.slice(0, 8).map((d, i) => (
              <RevealOnScroll key={d.id} delay={i * 50}>
                <div className="border border-line bg-ink-2 px-4 py-5 transition hover:border-ember/50">
                  <p className="font-display text-lg">{d.name}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="hero-orb hero-orb-a opacity-40" aria-hidden />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28">
          <RevealOnScroll>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ember-text">Contact</p>
            <h2 className="mt-4 max-w-3xl font-display text-4xl uppercase leading-[0.95] md:text-6xl">
              Collaborer avec
              <span className="text-ember-text"> KISHA BUZZ</span>
            </h2>
            <p className="mt-5 max-w-xl text-paper-muted">
              Couvertures, interviews, partenariats, production de contenu ou Arena Culture.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <ButtonLink href="/contact">Envoyer une demande</ButtonLink>
              <a
                href={`tel:${settings.phone.replace(/\s/g, "")}`}
                className="text-xl font-medium tracking-wide text-paper"
              >
                {settings.phone}
              </a>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </>
  );
}
