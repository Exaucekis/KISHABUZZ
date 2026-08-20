import { ArenaShowForm } from "@/components/admin/ArenaShowForm";
import { ArenaAdminNav } from "@/components/admin/ArenaAdminNav";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Nouvelle émission" };

export default async function NewArenaShowPage() {
  const [seasons, guests, events] = await Promise.all([
    prisma.arenaSeason.findMany({ orderBy: [{ year: "desc" }, { number: "desc" }] }),
    prisma.arenaGuest.findMany({ orderBy: { name: "asc" } }),
    prisma.event.findMany({
      where: { status: { in: ["PUBLISHED", "SOLD_OUT"] } },
      select: { id: true, title: true, startsAt: true, status: true },
      orderBy: { startsAt: "desc" },
      take: 80,
    }),
  ]);

  return (
    <div>
      <AdminPageIntro
        title="Nouvelle émission Arena"
        hint="Sans vidéo : Annoncer le prochain invité (affiche sous la une). Avec une vidéo (fichier ou lien YouTube / Facebook / Instagram / TikTok) : elle passe en première, l’ancienne va aux archives."
      />
      <ArenaAdminNav current="/admin/arena/emissions" />
      <ArenaShowForm seasons={seasons} guests={guests} events={events} />
    </div>
  );
}
