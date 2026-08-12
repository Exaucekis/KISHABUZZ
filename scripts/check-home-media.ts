import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function main() {
  const articles = await p.article.findMany({
    where: { status: "PUBLISHED" },
    select: { title: true, coverImage: true, contentType: true },
    take: 6,
  });
  const show = await p.arenaShow.findFirst({
    where: { status: "PUBLISHED" },
    select: { title: true, poster: true, slug: true },
  });
  const album = await p.photoAlbum.findFirst({
    where: { visible: true },
    include: { photos: { take: 4, where: { visible: true } } },
  });
  const video = await p.mediaAsset.findFirst({
    where: { kind: "VIDEO", visible: true, category: "ARENA_CULTURE" },
  });
  console.log(JSON.stringify({ articles, show, album, video }, null, 2));
}

main().finally(() => p.$disconnect());
