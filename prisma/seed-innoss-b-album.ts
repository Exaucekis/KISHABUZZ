import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const guestName = "Innoss'B";
  const slug = "innoss-b";
  const cover = "/arena/albums/innoss-b/01-portrait.jpg";

  const album = await prisma.photoAlbum.upsert({
    where: { slug },
    update: {
      guestName,
      title: "Innoss'B · Arena Grand Culture",
      description: "Album photo Arena Grand Culture — invité : Innoss'B.",
      coverImage: cover,
      emissionLabel: "Arena Grand Culture",
      visible: true,
      order: 0,
    },
    create: {
      guestName,
      slug,
      title: "Innoss'B · Arena Grand Culture",
      description: "Album photo Arena Grand Culture — invité : Innoss'B.",
      coverImage: cover,
      emissionLabel: "Arena Grand Culture",
      visible: true,
      order: 0,
    },
  });

  const photos = [
    {
      title: "Innoss'B — portrait",
      url: "/arena/albums/innoss-b/01-portrait.jpg",
    },
    {
      title: "Innoss'B — studio",
      url: "/arena/albums/innoss-b/02-studio.jpg",
    },
  ];

  for (const photo of photos) {
    const existing = await prisma.mediaAsset.findFirst({ where: { url: photo.url } });
    if (existing) {
      await prisma.mediaAsset.update({
        where: { id: existing.id },
        data: {
          title: photo.title,
          description: `Arena Grand Culture — ${guestName}`,
          kind: "IMAGE",
          thumbnail: photo.url,
          category: "ARENA_CULTURE",
          visible: true,
          albumId: album.id,
        },
      });
    } else {
      await prisma.mediaAsset.create({
        data: {
          title: photo.title,
          description: `Arena Grand Culture — ${guestName}`,
          kind: "IMAGE",
          url: photo.url,
          thumbnail: photo.url,
          category: "ARENA_CULTURE",
          visible: true,
          albumId: album.id,
        },
      });
    }
  }

  console.log(`OK album: ${album.guestName} (${album.slug}) — ${photos.length} photos`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
