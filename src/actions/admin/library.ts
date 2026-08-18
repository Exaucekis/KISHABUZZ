"use server";

import { requireAdmin } from "@/lib/admin";
import {
  classifyLibraryUrl,
  filterLibraryItems,
  mergeLibraryItems,
  type LibraryItem,
  type LibraryKind,
} from "@/lib/library";
import { prisma } from "@/lib/prisma";

function push(rows: LibraryItem[], url: string, title: string, createdAt: Date | number, kind?: LibraryKind) {
  const resolved = kind || classifyLibraryUrl(url);
  if (!resolved) return;
  rows.push({
    url,
    kind: resolved,
    title,
    createdAt: createdAt instanceof Date ? createdAt.getTime() : createdAt,
  });
}

export async function registerLibraryFile(input: {
  url: string;
  kind?: LibraryKind;
  title?: string;
  folder?: string;
}) {
  await requireAdmin();
  const url = input.url.trim();
  const kind = input.kind || classifyLibraryUrl(url);
  if (!url || !kind) return { ok: false as const, message: "Média invalide." };

  await prisma.libraryFile.upsert({
    where: { url },
    create: {
      url,
      kind,
      title: input.title?.trim() || "",
      folder: input.folder || "media",
    },
    update: {
      kind,
      ...(input.title?.trim() ? { title: input.title.trim() } : {}),
    },
  });
  return { ok: true as const };
}

export async function listLibraryItems(kind: "image" | "video" | "any" = "any"): Promise<LibraryItem[]> {
  await requireAdmin();

  const [files, assets, articles, guests, partners, albums, artists, settings] = await Promise.all([
    prisma.libraryFile.findMany({ orderBy: { createdAt: "desc" }, take: 120 }),
    prisma.mediaAsset.findMany({
      select: { url: true, thumbnail: true, title: true, kind: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 120,
    }),
    prisma.article.findMany({
      where: { coverImage: { not: "" } },
      select: { coverImage: true, title: true, updatedAt: true },
      take: 80,
    }),
    prisma.arenaGuest.findMany({
      where: { photo: { not: "" } },
      select: { photo: true, name: true, updatedAt: true },
      take: 80,
    }),
    prisma.partner.findMany({
      where: { logo: { not: "" } },
      select: { logo: true, name: true, updatedAt: true },
      take: 80,
    }),
    prisma.photoAlbum.findMany({
      where: { coverImage: { not: "" } },
      select: { coverImage: true, guestName: true, updatedAt: true },
      take: 80,
    }),
    prisma.spotlightArtist.findMany({
      where: { image: { not: "" } },
      select: { image: true, name: true, updatedAt: true },
      take: 80,
    }),
    prisma.siteSetting.findUnique({
      where: { id: "main" },
      select: { heroImage: true, heroVideo: true, updatedAt: true },
    }),
  ]);

  const rows: LibraryItem[] = [];
  for (const file of files) {
    push(rows, file.url, file.title || file.folder, file.createdAt, file.kind === "VIDEO" ? "VIDEO" : "IMAGE");
  }
  for (const asset of assets) {
    push(rows, asset.url, asset.title, asset.createdAt, asset.kind === "VIDEO" ? "VIDEO" : "IMAGE");
    if (asset.thumbnail) push(rows, asset.thumbnail, `${asset.title} · mini`, asset.createdAt, "IMAGE");
  }
  for (const article of articles) push(rows, article.coverImage, article.title, article.updatedAt, "IMAGE");
  for (const guest of guests) push(rows, guest.photo, guest.name, guest.updatedAt, "IMAGE");
  for (const partner of partners) push(rows, partner.logo, partner.name, partner.updatedAt, "IMAGE");
  for (const album of albums) push(rows, album.coverImage, album.guestName, album.updatedAt, "IMAGE");
  for (const artist of artists) push(rows, artist.image, artist.name, artist.updatedAt, "IMAGE");
  if (settings?.heroImage) push(rows, settings.heroImage, "Hero image", settings.updatedAt, "IMAGE");
  if (settings?.heroVideo) push(rows, settings.heroVideo, "Hero vidéo", settings.updatedAt);

  return filterLibraryItems(mergeLibraryItems(rows), kind).slice(0, 96);
}
