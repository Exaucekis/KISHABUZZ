import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Photos locales Wikimedia (public/artists) */
const covers = {
  concert1: "/artists/gaz-mawete.jpg",
  concert2: "/artists/fally-ipupa.jpg",
  studio: "/artists/innoss-b.png",
  crowd: "/artists/koffi-olomide.jpg",
  stage: "/artists/fally-ipupa.jpg",
  mic: "/artists/ferre-gola.jpg",
  lights: "/artists/innoss-b.png",
  urban: "/artists/dadju.jpg",
};

const articles = [
  {
    title: "Gaz Mawete : la voix qui fait vibrer la scène contemporaine",
    slug: "gaz-mawete-voix-scene-contemporaine",
    excerpt:
      "Portrait culturel : Gaz Mawete continue d'imposer sa signature artistique entre groove, émotion et modernité.",
    content: `<p>Gaz Mawete s'impose comme l'une des figures marquantes de la scène musicale actuelle.</p>
<p>Entre énergie scénique et écriture sensible, son parcours inspire une génération d'artistes et de fans.</p>
<p>KISHA BUZZ suit cette trajectoire médiatique et culturelle à travers chroniques, interviews et couvertures.</p>`,
    contentType: "CHRONIQUE",
    coverImage: covers.concert1,
    categorySlug: "culture",
  },
  {
    title: "Fally Ipupa : icône, scène et rayonnement continental",
    slug: "fally-ipupa-icone-scene-rayonnement",
    excerpt:
      "Analyse : comment Fally Ipupa structure une présence artistique forte, du live à l'image médiatique.",
    content: `<p>Fally Ipupa demeure une référence majeure de la musique congolaise contemporaine.</p>
<p>Sa capacité à rassembler les foules et à renouveler son univers place l'artiste au cœur des conversations culturelles.</p>`,
    contentType: "ARTICLE",
    coverImage: covers.stage,
    categorySlug: "culture",
  },
  {
    title: "Innoss'B : jeunesse, flow et nouvelle génération",
    slug: "innoss-b-jeunesse-flow-nouvelle-generation",
    excerpt:
      "Focus sur Innoss'B, figure de la nouvelle vague qui mêle urbanité, scène et culture pop.",
    content: `<p>Innoss'B incarne une génération qui assume un langage musical libre et connecté.</p>
<p>Entre hits et presence digitale, l'artiste dessine une autre façon d'exister médiatiquement.</p>`,
    contentType: "CHRONIQUE",
    coverImage: covers.lights,
    categorySlug: "media",
  },
  {
    title: "Ferre Gola : la constance d'un maestro de la rumba",
    slug: "ferre-gola-constance-maestro-rumba",
    excerpt:
      "Retour sur l'empreinte de Ferre Gola, entre héritage rumba et modernité scénique.",
    content: `<p>Ferre Gola reste une voix essentielle dans le paysage musical congolais.</p>
<p>Son style, son phrasé et sa présence continue nourrissent le débat culturel et artistique.</p>`,
    contentType: "ARTICLE",
    coverImage: covers.mic,
    categorySlug: "culture",
  },
  {
    title: "Koffi Olomidé : légende vivante et mémoire culturelle",
    slug: "koffi-olomide-legende-memoire-culturelle",
    excerpt:
      "Une lecture médiatique de l'héritage de Koffi Olomidé dans l'imaginaire collectif.",
    content: `<p>Koffi Olomidé appartient à la mémoire vivante de la musique congolaise.</p>
<p>Au-delà des tubes, c'est une histoire de scène, d'influence et de transmission.</p>`,
    contentType: "ANALYSIS",
    coverImage: covers.crowd,
    categorySlug: "culture",
  },
  {
    title: "Scène locale : talents émergents à suivre de près",
    slug: "scene-locale-talents-emergents",
    excerpt:
      "KISHA BUZZ met en lumière les artistes montants qui façonnent l'actualité culturelle.",
    content: `<p>La scène locale regorge de talents qui méritent une couverture médiatique sérieuse.</p>
<p>Chroniques, interviews et Arena Culture existent pour leur donner une plateforme.</p>`,
    contentType: "NEWS",
    coverImage: covers.studio,
    categorySlug: "actualites",
  },
];

async function main() {
  for (const item of articles) {
    const category = await prisma.category.findUnique({
      where: { slug: item.categorySlug },
    });

    await prisma.article.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        excerpt: item.excerpt,
        content: item.content,
        coverImage: item.coverImage,
        contentType: item.contentType,
        status: "PUBLISHED",
        publishedAt: new Date(),
        authorName: "KISHA BUZZ",
        categoryId: category?.id,
      },
      create: {
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt,
        content: item.content,
        coverImage: item.coverImage,
        contentType: item.contentType,
        status: "PUBLISHED",
        publishedAt: new Date(),
        authorName: "KISHA BUZZ",
        categoryId: category?.id,
        metaTitle: item.title,
        metaDescription: item.excerpt,
      },
    });
  }

  // Mettre à jour l'article de bienvenue avec une image
  await prisma.article.updateMany({
    where: { slug: "bienvenue-sur-kisha-buzz" },
    data: { coverImage: covers.urban },
  });

  console.log("Articles artistes + images OK");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
