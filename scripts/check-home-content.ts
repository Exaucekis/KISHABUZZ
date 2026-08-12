import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function main() {
  const [articles, shows, albums, videos, portfolio, partners] = await Promise.all([
    p.article.count({ where: { status: "PUBLISHED" } }),
    p.arenaShow.count({ where: { status: "PUBLISHED" } }),
    p.photoAlbum.count({ where: { visible: true } }),
    p.mediaAsset.count({ where: { kind: "VIDEO", visible: true, category: "ARENA_CULTURE" } }),
    p.portfolioItem.count({ where: { status: "PUBLISHED" } }),
    p.partner.count({ where: { visible: true } }),
  ]);
  console.log({ articles, shows, albums, videos, portfolio, partners });
}

main().finally(() => p.$disconnect());
