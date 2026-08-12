import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const guestName = "Maman Sharonne";
  const slug = "maman-sharonne";

  const album = await prisma.photoAlbum.upsert({
    where: { slug },
    update: {
      guestName,
      title: "Maman Sharonne · Arena Grand Culture",
      description: "Album photo du plateau Arena Grand Culture — invité : Maman Sharonne.",
      coverImage: "/arena/albums/invitee-plateau/01-invitee.jpg",
      emissionLabel: "Arena Grand Culture",
      visible: true,
      order: 1,
    },
    create: {
      guestName,
      slug,
      title: "Maman Sharonne · Arena Grand Culture",
      description: "Album photo du plateau Arena Grand Culture — invité : Maman Sharonne.",
      coverImage: "/arena/albums/invitee-plateau/01-invitee.jpg",
      emissionLabel: "Arena Grand Culture",
      visible: true,
      order: 1,
    },
  });

  // Nettoyer l'ancien slug temporaire s'il existe
  const old = await prisma.photoAlbum.findUnique({
    where: { slug: "invitee-arena-grand-culture" },
  });
  if (old && old.id !== album.id) {
    await prisma.mediaAsset.updateMany({
      where: { albumId: old.id },
      data: { albumId: album.id },
    });
    await prisma.photoAlbum.delete({ where: { id: old.id } });
  }

  const photos = [
    {
      title: "Maman Sharonne sur le plateau",
      url: "/arena/albums/invitee-plateau/01-invitee.jpg",
    },
    {
      title: "Échange avec l'animateur",
      url: "/arena/albums/invitee-plateau/02-plateau.jpg",
    },
    {
      title: "Vue d'ensemble du plateau",
      url: "/arena/albums/invitee-plateau/03-plateau-wide.jpg",
    },
    {
      title: "Animateur",
      url: "/arena/albums/invitee-plateau/04-animateur.jpg",
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

  console.log(`OK album: ${album.guestName} (${album.slug})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
