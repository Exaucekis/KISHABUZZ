import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const url = "/arena/videos/disha.mp4";
  const existing = await prisma.mediaAsset.findFirst({
    where: { url, kind: "VIDEO" },
  });

  if (existing) {
    await prisma.mediaAsset.update({
      where: { id: existing.id },
      data: {
        title: "DISHA",
        description: "Vidéo Arena Culture — DISHA.",
        category: "ARENA_CULTURE",
        visible: true,
        thumbnail: "",
      },
    });
    console.log("Updated DISHA video:", existing.id);
  } else {
    const created = await prisma.mediaAsset.create({
      data: {
        title: "DISHA",
        description: "Vidéo Arena Culture — DISHA.",
        kind: "VIDEO",
        url,
        thumbnail: "",
        category: "ARENA_CULTURE",
        visible: true,
        date: new Date(),
      },
    });
    console.log("Created DISHA video:", created.id);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
