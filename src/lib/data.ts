import { unstable_cache, unstable_noStore as noStore } from "next/cache";
import { cache } from "react";
import { ARENA_HOME_KEY, parseArenaHome } from "@/lib/arena-home";
import { CACHE_TAGS } from "@/lib/cache";
import { prisma } from "@/lib/prisma";
import { publishDueArticles, publishDueArenaShows } from "@/lib/publish-scheduled";
import { toSpotlightArtistCards } from "@/lib/spotlight-artists";

const fallbackSettings = {
  id: "main",
  siteTitle: "KISHA BUZZ",
  tagline:
    "Média, culture et contenus qui donnent une voix aux histoires, aux talents et aux événements.",
  aboutShort:
    "KISHA BUZZ est une plateforme média et professionnelle dédiée à la communication, aux chroniques, aux productions et à la couverture culturelle.",
  aboutLong: "",
  phone: "0974105940",
  email: "",
  address: "",
  whatsappEnabled: false,
  socialFacebook: "",
  socialInstagram: "",
  socialYoutube: "",
  socialX: "",
  socialTiktok: "",
  metaTitle: "KISHA BUZZ — Média, culture & contenus",
  metaDescription:
    "Plateforme média professionnelle : chroniques, publications, portfolio médiatique et Arena Culture.",
  heroImage: "",
  heroVideo: "",
  heroAlt: "",
  updatedAt: new Date(),
};

async function loadSettings() {
  try {
    return (await prisma.siteSetting.findUnique({ where: { id: "main" } })) ?? fallbackSettings;
  } catch (error) {
    console.error("settings: database unreachable, using fallback", error);
    return fallbackSettings;
  }
}

export const getSettings = cache(
  unstable_cache(loadSettings, ["settings"], {
    revalidate: 60,
    tags: [CACHE_TAGS.settings],
  })
);

async function loadHomePageData() {
  await Promise.all([publishDueArticles(), publishDueArenaShows()]);
  const [settings, feed, spotlightShow, domains, featuredAlbum] = await Promise.all([
    loadSettings(),
    prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        OR: [{ publishedAt: { lte: new Date() } }, { publishedAt: null }],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        coverAlt: true,
        coverFocus: true,
        contentType: true,
        publishedAt: true,
        authorName: true,
        category: { select: { name: true } },
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 6,
    }),
    prisma.arenaShow.findFirst({
      where: { status: { in: ["PUBLISHED", "SCHEDULED"] } },
      orderBy: [{ isFeatured: "desc" }, { isGuestOfWeek: "desc" }, { airDate: "desc" }],
      select: {
        slug: true,
        title: true,
        theme: true,
        poster: true,
        videoUrl: true,
        videoThumbnail: true,
        status: true,
        airDate: true,
        airTime: true,
        guests: {
          take: 1,
          select: {
            guest: { select: { name: true, photo: true, profession: true, slug: true } },
          },
        },
      },
    }),
    prisma.domain.findMany({
      where: { visible: true },
      select: { id: true, name: true, icon: true },
      orderBy: { order: "asc" },
    }),
    prisma.photoAlbum.findFirst({
      where: { visible: true },
      orderBy: [{ order: "asc" }, { date: "desc" }],
      select: { coverImage: true },
    }),
  ]);
  const [featuredVideo, about, portfolio, partners, spotlightArtists, arenaHome] = await Promise.all([
    prisma.mediaAsset.findFirst({
      where: { visible: true, kind: "VIDEO", category: "ARENA_CULTURE" },
      orderBy: [{ featured: "desc" }, { date: "desc" }, { createdAt: "desc" }],
      select: { title: true, description: true, url: true, thumbnail: true },
    }),
    prisma.pageContent.findUnique({
      where: { key: "about.qui" },
      select: { title: true, body: true },
    }),
    prisma.portfolioItem.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, slug: true, title: true, type: true, description: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 3,
    }),
    prisma.partner.findMany({
      where: { visible: true },
      select: { id: true, name: true, description: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      take: 6,
    }),
    prisma.spotlightArtist.findMany({
      where: { visible: true },
      select: { name: true, role: true, image: true },
      orderBy: { order: "asc" },
    }),
    loadArenaHome(),
  ]);

  const showVideo = String(spotlightShow?.videoUrl || "").trim();
  return {
    settings,
    feed,
    spotlightShow,
    domains,
    featuredAlbum,
    featuredVideo: showVideo
      ? {
          title: spotlightShow?.title || featuredVideo?.title || "Arena Culture",
          description: spotlightShow?.theme || featuredVideo?.description || "",
          url: showVideo,
          thumbnail: spotlightShow?.videoThumbnail || featuredVideo?.thumbnail || "",
        }
      : spotlightShow
        ? null
        : featuredVideo,
    about,
    portfolio,
    partners,
    artists: toSpotlightArtistCards(spotlightArtists),
    arenaHome,
  };
}

export const getHomePageData = cache(
  unstable_cache(loadHomePageData, ["home-page"], {
    revalidate: 60,
    tags: [CACHE_TAGS.home, CACHE_TAGS.settings, CACHE_TAGS.arena],
  })
);

export async function getPageContent(key: string) {
  return prisma.pageContent.findUnique({ where: { key } });
}

async function loadArenaHome() {
  try {
    const [home, presentation] = await Promise.all([
      prisma.pageContent.findUnique({ where: { key: ARENA_HOME_KEY } }),
      prisma.pageContent.findUnique({ where: { key: "arena.presentation" } }),
    ]);
    return parseArenaHome(home?.body, presentation?.body);
  } catch (error) {
    console.error("arena.home: database unreachable, using defaults", error);
    return parseArenaHome(null, "");
  }
}

export async function getArenaHome() {
  noStore();
  return loadArenaHome();
}

export async function getPublishedArticles(opts?: {
  contentType?: string | string[];
  take?: number;
  skip?: number;
  categorySlug?: string;
}) {
  await publishDueArticles();

  const types = opts?.contentType
    ? Array.isArray(opts.contentType)
      ? opts.contentType
      : [opts.contentType]
    : undefined;

  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      ...(types ? { contentType: { in: types } } : {}),
      ...(opts?.categorySlug
        ? { category: { slug: opts.categorySlug } }
        : {}),
      OR: [{ publishedAt: { lte: new Date() } }, { publishedAt: null }],
    },
    include: { category: true, tags: { include: { tag: true } } },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: opts?.take,
    skip: opts?.skip,
  });
}

export async function getArticleBySlug(
  slug: string,
  opts?: { includeUnpublished?: boolean }
) {
  await publishDueArticles();
  return prisma.article.findFirst({
    where: {
      slug,
      ...(opts?.includeUnpublished ? {} : { status: "PUBLISHED" }),
    },
    include: { category: true, tags: { include: { tag: true } } },
  });
}

export async function getPublishedShows(opts?: { take?: number; featured?: boolean }) {
  await publishDueArenaShows();
  return prisma.arenaShow.findMany({
    where: {
      status: "PUBLISHED",
      ...(opts?.featured ? { isFeatured: true } : {}),
    },
    include: {
      season: true,
      guests: { include: { guest: true } },
      media: { where: { visible: true } },
    },
    orderBy: [{ airDate: "desc" }, { number: "desc" }],
    take: opts?.take,
  });
}

export async function getArenaSpotlight() {
  await publishDueArenaShows();
  const include = {
    guests: { include: { guest: true } },
    season: true,
  } as const;
  const featured = await prisma.arenaShow.findFirst({
    where: { isFeatured: true, status: { in: ["PUBLISHED", "SCHEDULED"] } },
    include,
    orderBy: [{ airDate: "desc" }, { updatedAt: "desc" }],
  });
  if (featured) return featured;
  const guestWeek = await prisma.arenaShow.findFirst({
    where: { isGuestOfWeek: true, status: { in: ["PUBLISHED", "SCHEDULED"] } },
    include,
    orderBy: { airDate: "desc" },
  });
  if (guestWeek) return guestWeek;
  return prisma.arenaShow.findFirst({
    where: { status: "PUBLISHED" },
    include,
    orderBy: [{ airDate: "desc" }, { number: "desc" }],
  });
}

export async function getGuestOfTheWeek() {
  return getArenaSpotlight();
}

export async function getShowBySlug(slug: string) {
  return prisma.arenaShow.findFirst({
    where: { slug, status: { in: ["PUBLISHED", "ARCHIVED", "SCHEDULED"] } },
    include: {
      season: true,
      guests: { include: { guest: true } },
      media: { where: { visible: true }, orderBy: { createdAt: "desc" } },
    },
  });
}

export async function getVisiblePartners() {
  return prisma.partner.findMany({
    where: { visible: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
}

export async function getVisibleDomains() {
  return prisma.domain.findMany({
    where: { visible: true },
    orderBy: { order: "asc" },
  });
}

export async function getGallery(opts?: {
  kind?: "IMAGE" | "VIDEO";
  category?: string;
  take?: number;
}) {
  return prisma.mediaAsset.findMany({
    where: {
      visible: true,
      ...(opts?.kind ? { kind: opts.kind } : {}),
      ...(opts?.category ? { category: opts.category as never } : {}),
    },
    include: { arenaShow: true, portfolioItem: true },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: opts?.take,
  });
}

export async function getPortfolio(opts?: { type?: string; take?: number }) {
  return prisma.portfolioItem.findMany({
    where: {
      status: "PUBLISHED",
      ...(opts?.type ? { type: opts.type } : {}),
    },
    include: { media: { where: { visible: true } } },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: opts?.take,
  });
}

export async function getCategories(type?: string) {
  return prisma.category.findMany({
    where: type ? { type } : undefined,
    orderBy: { name: "asc" },
  });
}

export async function getPortfolioBySlug(slug: string) {
  return prisma.portfolioItem.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { media: { where: { visible: true }, orderBy: { createdAt: "desc" } } },
  });
}

export async function getRelatedArticles(
  article: { id: string; categoryId?: string | null; contentType: string },
  take = 3
) {
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: article.id },
      OR: [
        ...(article.categoryId ? [{ categoryId: article.categoryId }] : []),
        { contentType: article.contentType },
      ],
    },
    include: { category: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take,
  });
}

export async function getArenaGuests() {
  return prisma.arenaGuest.findMany({
    where: { visible: true },
    include: {
      appearances: {
        include: {
          show: { select: { id: true, title: true, slug: true, status: true, airDate: true } },
        },
      },
    },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });
}

export async function getArenaGuestBySlug(slug: string) {
  return prisma.arenaGuest.findFirst({
    where: { slug, visible: true },
    include: {
      appearances: {
        where: { show: { status: { in: ["PUBLISHED", "ARCHIVED", "SCHEDULED"] } } },
        include: {
          show: {
            select: {
              id: true,
              title: true,
              slug: true,
              theme: true,
              poster: true,
              airDate: true,
              status: true,
            },
          },
        },
        orderBy: { showId: "desc" },
      },
    },
  });
}

export async function getFeaturedArenaGuests(take = 8) {
  const featured = await prisma.arenaGuest.findMany({
    where: { visible: true, featured: true },
    orderBy: { name: "asc" },
    take,
  });
  if (featured.length) return featured;
  return prisma.arenaGuest.findMany({
    where: { visible: true, NOT: { photo: "" } },
    orderBy: { updatedAt: "desc" },
    take,
  });
}

const arenaVideoWhere = {
  kind: "VIDEO" as const,
  visible: true,
  OR: [{ category: "ARENA_CULTURE" }, { arenaShowId: { not: null } }],
};

export async function getFeaturedArenaVideo() {
  const featured = await prisma.mediaAsset.findFirst({
    where: { ...arenaVideoWhere, featured: true },
    include: { arenaShow: true },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
  if (featured) return featured;
  return prisma.mediaAsset.findFirst({
    where: arenaVideoWhere,
    include: { arenaShow: true },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
}

export async function getArenaSeasons() {
  return prisma.arenaSeason.findMany({
    orderBy: [{ year: "desc" }, { number: "desc" }],
    include: { _count: { select: { shows: true } } },
  });
}

export async function getArchivedShows(opts?: {
  year?: number;
  seasonId?: string;
  take?: number;
}) {
  return prisma.arenaShow.findMany({
    where: {
      status: "ARCHIVED",
      ...(opts?.seasonId ? { seasonId: opts.seasonId } : {}),
      ...(opts?.year
        ? {
            OR: [
              { season: { year: opts.year } },
              {
                airDate: {
                  gte: new Date(`${opts.year}-01-01`),
                  lt: new Date(`${opts.year + 1}-01-01`),
                },
              },
            ],
          }
        : {}),
    },
    include: {
      season: true,
      guests: { include: { guest: true } },
    },
    orderBy: [{ airDate: "desc" }, { number: "desc" }],
    take: opts?.take,
  });
}

export async function getUpcomingShow() {
  const now = new Date();
  return prisma.arenaShow.findFirst({
    where: {
      status: "PUBLISHED",
      airDate: { gt: now },
    },
    include: {
      season: true,
      guests: { include: { guest: true } },
    },
    orderBy: { airDate: "asc" },
  });
}

export async function searchAll(q: string) {
  await Promise.all([publishDueArticles(), publishDueArenaShows()]);
  const query = q.trim();
  if (!query || query.length < 2) {
    return {
      articles: [],
      shows: [],
      guests: [],
      portfolio: [],
      partners: [],
      media: [],
      events: [],
    };
  }

  const [articles, shows, guests, portfolio, partners, media, events] = await Promise.all([
    prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: query } },
          { excerpt: { contains: query } },
          { content: { contains: query } },
        ],
      },
      take: 12,
      orderBy: { publishedAt: "desc" },
    }),
    prisma.arenaShow.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: query } },
          { theme: { contains: query } },
          { description: { contains: query } },
        ],
      },
      take: 12,
      include: { guests: { include: { guest: true } } },
    }),
    prisma.arenaGuest.findMany({
      where: {
        visible: true,
        OR: [{ name: { contains: query } }, { profession: { contains: query } }],
      },
      take: 12,
    }),
    prisma.portfolioItem.findMany({
      where: {
        status: "PUBLISHED",
        OR: [{ title: { contains: query } }, { description: { contains: query } }],
      },
      take: 12,
    }),
    prisma.partner.findMany({
      where: {
        visible: true,
        OR: [{ name: { contains: query } }, { description: { contains: query } }],
      },
      take: 12,
    }),
    prisma.mediaAsset.findMany({
      where: {
        visible: true,
        OR: [{ title: { contains: query } }, { description: { contains: query } }],
      },
      take: 12,
    }),
    prisma.event.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: query } },
          { summary: { contains: query } },
          { description: { contains: query } },
          { city: { contains: query } },
          { venueName: { contains: query } },
        ],
      },
      take: 12,
      orderBy: { startsAt: "asc" },
      select: { id: true, slug: true, title: true, city: true, venueName: true, startsAt: true },
    }),
  ]);

  return { articles, shows, guests, portfolio, partners, media, events };
}

export async function getArenaPhotoAlbums() {
  return prisma.photoAlbum.findMany({
    where: { visible: true },
    include: {
      photos: {
        where: { visible: true, kind: "IMAGE" },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: [{ order: "asc" }, { date: "desc" }, { createdAt: "desc" }],
  });
}

export async function getArenaPhotoAlbumBySlug(slug: string) {
  return prisma.photoAlbum.findFirst({
    where: { slug, visible: true },
    include: {
      photos: {
        where: { visible: true, kind: "IMAGE" },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function getPublishedEvents(opts?: { categorySlug?: string }) {
  return prisma.event.findMany({
    where: {
      status: { in: ["PUBLISHED", "SOLD_OUT"] },
      ...(opts?.categorySlug ? { category: { slug: opts.categorySlug, visible: true } } : {}),
    },
    include: {
      category: true,
      ticketTypes: {
        where: { visible: true },
        orderBy: { sortOrder: "asc" },
      },
      sessions: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: [{ featured: "desc" }, { startsAt: "asc" }],
  });
}

export async function getEventBySlug(slug: string) {
  return prisma.event.findFirst({
    where: {
      slug,
      status: { in: ["PUBLISHED", "SOLD_OUT", "ENDED", "CANCELLED"] },
    },
    include: {
      category: true,
      organizer: { select: { name: true } },
      ticketTypes: {
        where: { visible: true },
        orderBy: { sortOrder: "asc" },
        include: { sessions: { include: { session: true } } },
      },
      sessions: { orderBy: { sortOrder: "asc" } },
      media: { where: { visible: true }, orderBy: { createdAt: "desc" } },
    },
  });
}

export async function getVisibleEventCategories() {
  return prisma.eventCategory.findMany({
    where: { visible: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
}
