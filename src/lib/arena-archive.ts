import { prisma } from "@/lib/prisma";

export async function snapshotArenaMedia(input: {
  title: string;
  kind: "IMAGE" | "VIDEO";
  url: string;
  thumbnail?: string;
}) {
  const url = String(input.url || "").trim();
  if (!url) return;
  const title = `Archive · ${input.title}`.slice(0, 220);
  const existing = await prisma.mediaAsset.findFirst({
    where: { url, category: "ARENA_CULTURE", kind: input.kind },
    select: { id: true, title: true, thumbnail: true },
  });
  if (existing) {
    await prisma.mediaAsset.update({
      where: { id: existing.id },
      data: {
        featured: false,
        visible: true,
        arenaShowId: null,
        title: existing.title.startsWith("Archive ·") ? existing.title : title,
        thumbnail: input.thumbnail || existing.thumbnail || url,
      },
    });
    return;
  }
  await prisma.mediaAsset.create({
    data: {
      title,
      description: "Ancien contenu Arena, conservé en archives.",
      kind: input.kind,
      url,
      thumbnail: input.thumbnail || url,
      alt: input.title,
      category: "ARENA_CULTURE",
      visible: true,
      featured: false,
      date: new Date(),
    },
  });
}

export async function snapshotShowForArchive(show: {
  title: string;
  videoUrl?: string | null;
  videoThumbnail?: string | null;
  poster?: string | null;
}) {
  if (show.videoUrl) {
    await snapshotArenaMedia({
      title: show.title,
      kind: "VIDEO",
      url: show.videoUrl,
      thumbnail: show.videoThumbnail || undefined,
    });
  }
  if (show.poster) {
    await snapshotArenaMedia({
      title: show.title,
      kind: "IMAGE",
      url: show.poster,
    });
  }
}

export function archiveLabel(title: string) {
  return title.replace(/^Archive · /, "");
}
