import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [
    guests,
    shows,
    videos,
    albums,
    featuredGuests,
    featuredVideos,
  ] = await Promise.all([
    prisma.arenaGuest.groupBy({ by: ["visible"], _count: true }),
    prisma.arenaShow.groupBy({ by: ["status"], _count: true }),
    prisma.mediaAsset.count({
      where: { kind: "VIDEO", OR: [{ category: "ARENA_CULTURE" }, { arenaShowId: { not: null } }] },
    }),
    prisma.photoAlbum.count({ where: { visible: true } }),
    prisma.arenaGuest.count({ where: { visible: true, featured: true } }),
    prisma.mediaAsset.count({ where: { kind: "VIDEO", featured: true } }),
  ]);

  const sampleGuest = await prisma.arenaGuest.findFirst({
    where: { visible: true },
    select: { slug: true, name: true },
  });
  const sampleShow = await prisma.arenaShow.findFirst({
    where: { status: "PUBLISHED" },
    select: { slug: true, title: true, videoUrl: true, videoThumbnail: true },
  });

  console.log(
    JSON.stringify(
      {
        guests,
        shows,
        arenaVideos: videos,
        visibleAlbums: albums,
        featuredGuests,
        featuredVideos,
        sampleGuest,
        sampleShow: sampleShow
          ? {
              slug: sampleShow.slug,
              title: sampleShow.title,
              hasVideo: Boolean(sampleShow.videoUrl),
              hasThumbnail: Boolean(sampleShow.videoThumbnail),
            }
          : null,
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
