import { notFound } from "next/navigation";
import { ArenaShowForm } from "@/components/admin/ArenaShowForm";
import { ArenaAdminNav } from "@/components/admin/ArenaAdminNav";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const show = await prisma.arenaShow.findUnique({ where: { id } });
  return { title: show ? `Éditer · ${show.title}` : "Émission" };
}

export default async function EditArenaShowPage({ params }: Props) {
  const { id } = await params;
  const [show, guests, domains] = await Promise.all([
    prisma.arenaShow.findUnique({
      where: { id },
      include: { guests: true },
    }),
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
  if (!show) notFound();

  return (
    <div>
      <AdminPageIntro
        title={`Éditer · ${show.title}`}
        hint="Nom de l’invité, thème, vidéo et miniature. Pas d’affiche ici — le prochain invité se gère dans son onglet."
      />
      <ArenaAdminNav current="/admin/arena/emissions" />
      <ArenaShowForm show={show} guests={guests} domains={domains} />
    </div>
  );
}
