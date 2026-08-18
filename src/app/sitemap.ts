import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { publishDueArticles, publishDueArenaShows } from "@/lib/publish-scheduled";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await Promise.all([publishDueArticles(), publishDueArenaShows()]);
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const staticRoutes = [
    "",
    "/a-propos",
    "/chroniques",
    "/publications",
    "/portfolio",
    "/evenements",
    "/arena-culture",
    "/arena-culture/emissions",
    "/arena-culture/invites",
    "/arena-culture/affiches",
    "/arena-culture/photos",
    "/arena-culture/videos",
    "/arena-culture/archives",
    "/collaborations",
    "/contact",
    "/recherche",
    "/mentions-legales",
    "/politique-de-confidentialite",
    "/conditions-d-utilisation",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const [articles, shows, portfolio, guests, albums, events] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, contentType: true, updatedAt: true },
    }),
    prisma.arenaShow.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.portfolioItem.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.arenaGuest.findMany({
      where: { visible: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.photoAlbum.findMany({
      where: { visible: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.event.findMany({
      where: { status: { in: ["PUBLISHED", "SOLD_OUT"] } },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  return [
    ...staticRoutes,
    ...articles.map((a) => ({
      url: `${base}${a.contentType === "CHRONIQUE" ? "/chroniques" : "/publications"}/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...shows.map((s) => ({
      url: `${base}/arena-culture/emissions/${s.slug}`,
      lastModified: s.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...portfolio.map((p) => ({
      url: `${base}/portfolio/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...guests.map((g) => ({
      url: `${base}/arena-culture/invites/${g.slug}`,
      lastModified: g.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...albums.map((a) => ({
      url: `${base}/arena-culture/albums/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...events.map((event) => ({
      url: `${base}/evenements/${event.slug}`,
      lastModified: event.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
