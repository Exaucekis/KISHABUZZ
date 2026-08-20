import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "superadmin@kishabuzz.com";
  const password = process.env.ADMIN_PASSWORD || "KishaBuzz2026!";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { role: "SUPERADMIN", name: "Superadmin KISHA BUZZ", passwordHash },
    create: {
      email,
      name: "Superadmin KISHA BUZZ",
      passwordHash,
      role: "SUPERADMIN",
    },
  });

  await prisma.user.updateMany({
    where: { email: { not: email }, role: "SUPERADMIN" },
    data: { role: "ADMIN" },
  });

  await prisma.siteSetting.upsert({
    where: { id: "main" },
    update: { email: "contact@kisha-buzz.com" },
    create: {
      id: "main",
      siteTitle: "KISHA BUZZ",
      tagline:
        "Média, culture et marketing pour donner une voix aux histoires, aux talents et aux événements.",
      aboutShort:
        "KISHA BUZZ — La révolution culturelle et marketing. Plateforme média et professionnelle dédiée à la communication, aux chroniques, aux productions et à la couverture culturelle.",
      aboutLong: "",
      phone: "0974105940",
      email: "contact@kisha-buzz.com",
      whatsappEnabled: false,
      metaTitle: "KISHA BUZZ — Média, culture & contenus",
      metaDescription:
        "Plateforme média professionnelle : chroniques, publications, portfolio médiatique et Arena Culture.",
    },
  });

  const publicationCategories = [
    { name: "Culture", slug: "culture" },
    { name: "Média", slug: "media" },
    { name: "Société", slug: "societe" },
    { name: "Événements", slug: "evenements" },
    { name: "Interviews", slug: "interviews" },
    { name: "Actualités", slug: "actualites" },
  ];

  for (const cat of publicationCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { ...cat, type: "publication" },
    });
  }

  const domains = [
    { name: "Média", slug: "media", order: 1 },
    { name: "Communication", slug: "communication", order: 2 },
    { name: "Interviews", slug: "interviews", order: 3 },
    { name: "Reportages", slug: "reportages", order: 4 },
    { name: "Événementiel", slug: "evenementiel", order: 5 },
    { name: "Culture", slug: "culture", order: 6 },
    { name: "Production de contenu", slug: "production-contenu", order: 7 },
    { name: "Couverture médiatique", slug: "couverture-mediatique", order: 8 },
    { name: "Animation", slug: "animation", order: 9 },
    { name: "Chroniques", slug: "chroniques", order: 10 },
  ];

  for (const d of domains) {
    await prisma.domain.upsert({
      where: { slug: d.slug },
      update: {},
      create: d,
    });
  }

  const eventCategories = [
    { name: "Concert", slug: "concert", order: 1 },
    { name: "Festival", slug: "festival", order: 2 },
    { name: "Soirée", slug: "soiree", order: 3 },
    { name: "Conférence", slug: "conference", order: 4 },
    { name: "Arena Culture", slug: "arena-culture", order: 5 },
    { name: "Autre", slug: "autre", order: 6 },
  ];

  for (const cat of eventCategories) {
    await prisma.eventCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  const pages = [
    {
      key: "about.qui",
      title: "Qui sommes-nous ?",
      body: "KISHA BUZZ est une plateforme média et professionnelle. Les détails du parcours et de l'identité seront précisés depuis le back-office.",
    },
    {
      key: "about.parcours",
      title: "Notre parcours",
      body: "Le parcours professionnel sera publié ici dès qu'il sera communiqué.",
    },
    {
      key: "about.expertise",
      title: "Notre expertise",
      body: "L'expertise de KISHA BUZZ sera détaillée depuis l'espace administrateur.",
    },
    {
      key: "about.vision",
      title: "Notre vision",
      body: "La vision éditoriale et médiatique de KISHA BUZZ sera publiée ici.",
    },
    {
      key: "arena.presentation",
      title: "Arena Culture",
      body: "Arena Culture est l'univers médiatique intégré de KISHA BUZZ : émissions, invités, affiches, photos, vidéos et archives.",
    },
    {
      key: "contact.intro",
      title: "Contact",
      body: "Vous souhaitez collaborer avec KISHA BUZZ, organiser une couverture, participer à une émission ou discuter d'un projet médiatique ?",
    },
  ];

  for (const page of pages) {
    await prisma.pageContent.upsert({
      where: { key: page.key },
      update: {},
      create: page,
    });
  }

  const existingArticle = await prisma.article.findUnique({
    where: { slug: "bienvenue-sur-kisha-buzz" },
  });
  if (!existingArticle) {
    const cat = await prisma.category.findUnique({ where: { slug: "actualites" } });
    await prisma.article.create({
      data: {
        title: "Bienvenue sur KISHA BUZZ",
        slug: "bienvenue-sur-kisha-buzz",
        excerpt:
          "La plateforme médiatique est en ligne. Chroniques, publications et Arena Culture seront enrichis depuis le back-office.",
        content: `<p>KISHA BUZZ lance sa présence numérique professionnelle.</p>
<p>Cette plateforme accueillera prochainement chroniques, publications, portfolio médiatique, collaborations et l'univers <strong>Arena Culture</strong>.</p>
<p>Les contenus seront publiés et mis à jour depuis l'espace administrateur.</p>`,
        contentType: "NEWS",
        status: "PUBLISHED",
        publishedAt: new Date(),
        authorName: "KISHA BUZZ",
        categoryId: cat?.id,
        metaTitle: "Bienvenue sur KISHA BUZZ",
        metaDescription:
          "Lancement de la plateforme média KISHA BUZZ : chroniques, portfolio et Arena Culture.",
      },
    });
  }

  console.log("Seed terminé");
  console.log(`Admin: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
