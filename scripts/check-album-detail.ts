import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const album = await prisma.photoAlbum.findFirst({
    where: { slug: "maman-sharonne" },
    include: { photos: true },
  });
  console.log(JSON.stringify(album, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
