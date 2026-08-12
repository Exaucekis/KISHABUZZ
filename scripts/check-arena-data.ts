import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const shows = await prisma.arenaShow.findMany({
    select: { slug: true, title: true, status: true, poster: true, isGuestOfWeek: true },
  });
  const albums = await prisma.photoAlbum.findMany({
    select: { slug: true, guestName: true, visible: true },
  });
  console.log("shows", shows);
  console.log("albums", albums);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
