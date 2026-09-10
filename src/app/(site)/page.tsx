import Link from "next/link";
import { connection } from "next/server";
import { ArticleCard } from "@/components/content/ArticleCard";
import { DomainMarquee } from "@/components/home/DomainMarquee";
import { HomeHero } from "@/components/home/HomeHero";
import { ArtistRail } from "@/components/home/ArtistRail";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PublicImage } from "@/components/media/PublicImage";
import { VideoEmbed } from "@/components/media/VideoEmbed";
import { getFeaturedImageEngagement, getHomePageData } from "@/lib/data";
import { arenaSpotlightGuest } from "@/lib/arena-spotlight";
import { formatDate } from "@/lib/utils";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  await connection();
  const session = await auth();
  const home = await getHomePageData(session?.user?.id);
  const {
    settings,
    feed,
    announcedShow,
    domains,
    galleryAlbums,
    featuredVideo,
    about,
    portfolio,
    partners,
    artists,
    arenaHome,
  } = home;
  const heroEngagement = settings.heroImage
    ? await getFeaturedImageEngagement("HOME_HERO", "main", session?.user?.id)
    : null;

  const guest = arenaSpotlightGuest(announcedShow);
  const announced = Boolean(announcedShow);
  const nextGuestPoster = announcedShow?.poster || guest?.photo || "";

  return (
    <>
      <HomeHero
        tagline={settings.tagline}
        heroImage={settings.heroImage}
        heroVideo={settings.heroVideo}
        heroAlt={settings.heroAlt}
        imageEngagement={heroEngagement || undefined}
      />

      <DomainMarquee items={domains.map((d) => ({ name: d.name, icon: d.icon }))} />

      <ArtistRail artists={artists} signedIn={Boolean(session?.user?.id)} />

      {featuredVideo ? (
        <section className="kb-defer mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Nouvelle émission"
              title={featuredVideo.title}
              description={
                featuredVideo.artistName
                  ? featuredVideo.artistName
                  : featuredVideo.description || undefined
              }
            />
            <Link
              href={
                featuredVideo.slug
                  ? `/arena-culture/emissions/${featuredVideo.slug}`
                  : "/arena-culture/emissions"
              }
              className="shrink-0 text-sm font-semibold text-ember-text"
            >
              Voir l’émission →
            </Link>
          </div>
          <div className="home-video">
            <VideoEmbed
              url={featuredVideo.url}
              title={featuredVideo.title}
              poster={featuredVideo.thumbnail || undefined}
            />
          </div>
        </section>
      ) : null}

      <section className="home-spotlight relative overflow-hidden border-y border-line">
        {nextGuestPoster ? (
          <>
            <div className="home-spotlight__bg" aria-hidden>
              <PublicImage src={nextGuestPoster} alt="" fill sizes="100vw" className="object-cover" />
            </div>
            <div className="home-spotlight__shade" aria-hidden />
          </>
        ) : (
          <div className="home-spotlight__shade" aria-hidden />
        )}
        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 py-20 md:grid-cols-[1.05fr_0.95fr] md:items-end md:px-6 md:py-28">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#ffb347]">
              Arena Culture · {arenaHome.spotlight.emptyLabel}
            </p>
            <h2 className="mt-4 font-display text-4xl uppercase leading-[0.95] text-white md:text-6xl lg:text-7xl">
              {announced
                ? guest?.name || announcedShow?.title || arenaHome.spotlight.emptyTitle
                : arenaHome.spotlight.emptyTitle}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
              {announced
                ? [announcedShow?.theme, guest?.profession].filter(Boolean).join(" · ") ||
                  "Prochain invité Arena Culture."
                : arenaHome.spotlight.emptyBody}
              {announced && announcedShow?.airDate
                ? ` · ${formatDate(announcedShow.airDate)}${announcedShow.airTime ? ` · ${announcedShow.airTime}` : ""}`
                : ""}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink
                href={
                  announced && announcedShow
                    ? `/arena-culture/emissions/${announcedShow.slug}`
                    : "/contact"
                }
                className="!bg-[#ff8c00] !text-black hover:!bg-[#ff9f2e]"
              >
                {announced ? "Voir l'affiche" : arenaHome.spotlight.emptyCta}
              </ButtonLink>
              <ButtonLink
                href="/arena-culture"
                variant="secondary"
                className="!border-white/45 !text-white hover:!bg-white/10"
              >
                Entrer dans Arena
              </ButtonLink>
            </div>
          </div>

          {nextGuestPoster ? (
            <div className="home-spotlight__poster">
              <PublicImage
                src={nextGuestPoster}
                alt={guest?.name || announcedShow?.title || "Prochain invité Arena Culture"}
                fill
                sizes="(max-width: 768px) 90vw, 42vw"
                className="object-cover"
              />
            </div>
          ) : null}
        </div>
      </section>

      <section id="univers-arena" className="kb-defer mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow={arenaHome.explore.eyebrow}
            title={arenaHome.explore.title}
            description="Albums photos Arena Culture : un album par invité, dans l’ordre du plateau."
          />
          <Link href="/arena-culture/photos" className="shrink-0 text-sm font-semibold text-ember-text">
            Galerie Arena →
          </Link>
        </div>
        {galleryAlbums.length ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {galleryAlbums.map((album) => {
              const cover = album.coverImage || album.photos[0]?.url || "";
              if (!cover) return null;
              return (
                <Link
                  key={album.slug}
                  href={`/arena-culture/albums/${album.slug}`}
                  className="group block focus-ring"
                >
                  <div className="kb-shine relative aspect-[16/10] overflow-hidden bg-ink-3">
                    <PublicImage
                      src={cover}
                      alt={album.guestName || album.title}
                      fill
                      sizes="(max-width: 768px) 90vw, 33vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <p className="mt-4 text-xs uppercase tracking-[0.2em] text-ember-text">
                    Arena Culture
                  </p>
                  <h3 className="mt-2 font-display text-2xl transition group-hover:text-ember-text">
                    {album.guestName || album.title}
                  </h3>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Galerie Arena"
            description="Les photos d’invités paraîtront ici, dans Arena Culture."
            action={<ButtonLink href="/arena-culture">Entrer dans Arena Culture</ButtonLink>}
          />
        )}
      </section>

      <section id="actualites" className="kb-defer border-y border-line bg-ink-2">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28">
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
          {feed.length ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {feed.map((article) => (
                <ArticleCard
                  key={article.id}
                  href={
                    article.contentType === "CHRONIQUE"
                      ? `/chroniques/${article.slug}`
                      : `/publications/${article.slug}`
                  }
                  title={article.title}
                  excerpt={article.excerpt}
                  coverImage={article.coverImage}
                  coverAlt={article.coverAlt}
                  coverFocus={article.coverFocus}
                  category={article.category?.name}
                  date={article.publishedAt}
                  author={article.authorName}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Contenus à venir"
              description="Les chroniques et publications seront disponibles dès leur publication."
              action={<ButtonLink href="/contact">Proposer une collaboration</ButtonLink>}
            />
          )}
        </div>
      </section>

      {portfolio.length ? (
        <section className="kb-defer mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28">
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
          <div className="grid gap-5 md:grid-cols-2">
            {portfolio.map((item) => (
              <Link
                key={item.id}
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
            ))}
          </div>
        </section>
      ) : null}

      {partners.length ? (
        <section className="kb-defer mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28">
          <SectionHeading
            eyebrow="Collaborations"
            title="Partenaires & collaborations"
            description="Les partenaires officiels de KISHA BUZZ."
          />
          <div className="mt-12 grid gap-8 sm:grid-cols-2 md:grid-cols-3">
            {partners.map((p) => (
              <div key={p.id} className="border-t border-ember/40 pt-5">
                <h3 className="font-display text-xl">{p.name}</h3>
                {p.description ? <p className="mt-2 text-sm text-paper-muted">{p.description}</p> : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="kb-defer border-y border-line">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 md:grid-cols-2 md:px-6 md:py-28">
          <div>
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
          </div>
          <div className="grid grid-cols-2 gap-3">
            {domains.slice(0, 8).map((d) => (
              <div key={d.id} className="border border-line bg-ink-2 px-4 py-5 transition hover:border-ember/50">
                <p className="font-display text-lg">{d.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="kb-defer border-y border-line bg-ink-2">
        <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ember-text">
            Newsletter
          </p>
          <h2 className="mt-4 font-display text-3xl uppercase leading-[0.95] md:text-5xl">
            Rester dans le buzz
          </h2>
          <p className="mt-4 text-paper-muted">
            Un email quand une chronique ou une publication sort. Pas de spam.
          </p>
          <div className="mt-8">
            <NewsletterForm source="home" />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28">
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
            <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="text-xl font-medium tracking-wide text-paper">
              {settings.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
