import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const poster = "/arena/posters/terminusboy-14-aout-2026.jpg";
  const airDate = new Date("2026-08-14T20:00:00+02:00");

  // Une seule émission « invité de la semaine »
  await prisma.arenaShow.updateMany({
    where: { isGuestOfWeek: true },
    data: { isGuestOfWeek: false },
  });

  const guest = await prisma.arenaGuest.upsert({
    where: { slug: "terminusboy" },
    update: {
      name: "TerminusBoy",
      profession: "Artiste rappeur",
      bio: "Invité d'Arena Grand Culture.",
      photo: poster,
    },
    create: {
      name: "TerminusBoy",
      slug: "terminusboy",
      profession: "Artiste rappeur",
      bio: "Invité d'Arena Grand Culture.",
      photo: poster,
    },
  });

  const maxNumber = await prisma.arenaShow.aggregate({ _max: { number: true } });
  const nextNumber = (maxNumber._max.number || 0) + 1;

  const existing = await prisma.arenaShow.findUnique({
    where: { slug: "terminusboy-14-aout-2026" },
  });

  const show = existing
    ? await prisma.arenaShow.update({
        where: { id: existing.id },
        data: {
          title: "TerminusBoy — Arena Grand Culture",
          theme: "Artiste rappeur",
          description:
            "Prochain invité Arena Grand Culture : TerminusBoy (artiste rappeur). Vendredi 14 août 2026 à 20h00 sur Fire TV. Animation : Mr Etoile Kisha Officiel01.",
          airDate,
          airTime: "20h00",
          poster,
          status: "PUBLISHED",
          isFeatured: true,
          isGuestOfWeek: true,
        },
      })
    : await prisma.arenaShow.create({
        data: {
          number: nextNumber,
          title: "TerminusBoy — Arena Grand Culture",
          slug: "terminusboy-14-aout-2026",
          theme: "Artiste rappeur",
          description:
            "Prochain invité Arena Grand Culture : TerminusBoy (artiste rappeur). Vendredi 14 août 2026 à 20h00 sur Fire TV. Animation : Mr Etoile Kisha Officiel01.",
          airDate,
          airTime: "20h00",
          poster,
          status: "PUBLISHED",
          isFeatured: true,
          isGuestOfWeek: true,
        },
      });

  await prisma.arenaShowGuest.upsert({
    where: {
      showId_guestId: { showId: show.id, guestId: guest.id },
    },
    update: { role: "invité" },
    create: {
      showId: show.id,
      guestId: guest.id,
      role: "invité",
    },
  });

  const mediaExisting = await prisma.mediaAsset.findFirst({
    where: { url: poster },
  });
  if (mediaExisting) {
    await prisma.mediaAsset.update({
      where: { id: mediaExisting.id },
      data: {
        title: "Affiche — TerminusBoy",
        description: "Vendredi 14 août 2026 · 20h00 · Fire TV",
        kind: "IMAGE",
        thumbnail: poster,
        category: "ARENA_CULTURE",
        visible: true,
        date: airDate,
        arenaShowId: show.id,
      },
    });
  } else {
    await prisma.mediaAsset.create({
      data: {
        title: "Affiche — TerminusBoy",
        description: "Vendredi 14 août 2026 · 20h00 · Fire TV",
        kind: "IMAGE",
        url: poster,
        thumbnail: poster,
        category: "ARENA_CULTURE",
        visible: true,
        date: airDate,
        arenaShowId: show.id,
      },
    });
  }

  console.log(`OK prochain invité: ${guest.name} — ${show.slug}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
