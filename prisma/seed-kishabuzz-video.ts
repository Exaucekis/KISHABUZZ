import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const url = "/arena/videos/kishabuzz.mp4";
  const legacyUrl = "/arena/videos/disha.mp4";

  const existing =
    (await prisma.mediaAsset.findFirst({ where: { url, kind: "VIDEO" } })) ||
    (await prisma.mediaAsset.findFirst({ where: { url: legacyUrl, kind: "VIDEO" } })) ||
    (await prisma.mediaAsset.findFirst({
      where: { kind: "VIDEO", title: { equals: "DISHA", mode: "insensitive" } },
    }));

  const data = {
    title: "Kishabuzz",
    description: "Vidéo Arena Culture — Kishabuzz.",
    url,
    category: "ARENA_CULTURE" as const,
    visible: true,
    thumbnail: "",
  };

  if (existing) {
    await prisma.mediaAsset.update({
      where: { id: existing.id },
      data,
    });
    console.log("Updated Kishabuzz video:", existing.id);
  } else {
    const created = await prisma.mediaAsset.create({
      data: {
        ...data,
        kind: "VIDEO",
        date: new Date(),
      },
    });
    console.log("Created Kishabuzz video:", created.id);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
