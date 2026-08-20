import { ArenaShowForm } from "@/components/admin/ArenaShowForm";
import { ArenaAdminNav } from "@/components/admin/ArenaAdminNav";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Nouvelle émission" };

export default async function NewArenaShowPage() {
  const [seasons, guests] = await Promise.all([
    prisma.arenaSeason.findMany({ orderBy: [{ year: "desc" }, { number: "desc" }] }),
    prisma.arenaGuest.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <AdminPageIntro
        title="Nouvelle émission Arena"
        hint="Titre, affiche, vidéo, puis Annoncer le prochain invité ou Publier à la une. L’émission précédente part aux archives."
      />
      <ArenaAdminNav current="/admin/arena/emissions" />
      <ArenaShowForm seasons={seasons} guests={guests} />
    </div>
  );
}
