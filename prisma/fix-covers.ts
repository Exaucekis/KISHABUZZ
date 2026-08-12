import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const covers: Record<string, string> = {
  "gaz-mawete-voix-scene-contemporaine": "/artists/gaz-mawete.jpg",
  "fally-ipupa-icone-scene-rayonnement": "/artists/fally-ipupa.jpg",
  "innoss-b-jeunesse-flow-nouvelle-generation": "/artists/innoss-b.png",
  "ferre-gola-constance-maestro-rumba": "/artists/ferre-gola.jpg",
  "koffi-olomide-legende-memoire-culturelle": "/artists/koffi-olomide.jpg",
  "scene-locale-talents-emergents": "/artists/dadju.jpg",
  "bienvenue-sur-kisha-buzz": "/artists/gaz-mawete.jpg",
};

async function main() {
  for (const [slug, coverImage] of Object.entries(covers)) {
    const res = await prisma.article.updateMany({
      where: { slug },
      data: { coverImage },
    });
    console.log(slug, res.count);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
