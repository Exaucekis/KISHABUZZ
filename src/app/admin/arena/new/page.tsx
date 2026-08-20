import { ArenaShowForm } from "@/components/admin/ArenaShowForm";
import { ArenaAdminNav } from "@/components/admin/ArenaAdminNav";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Nouvelle émission" };

export default async function NewArenaShowPage() {
  const [guests, domains] = await Promise.all([
    prisma.arenaGuest.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, profession: true },
    }),
    prisma.domain.findMany({
      where: { visible: true },
      orderBy: { order: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div>
      <AdminPageIntro
        title="Nouvelle émission"
        hint="Nom de l’invité, domaine, vidéo et miniature. L’émission est lancée tout de suite sur la page publique."
      />
      <ArenaAdminNav current="/admin/arena/emissions" />
      <ArenaShowForm guests={guests} domains={domains} />
    </div>
  );
}
