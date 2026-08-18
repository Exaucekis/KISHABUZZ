import { notFound } from "next/navigation";
import { ArenaShowForm } from "@/components/admin/ArenaShowForm";
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
  const [show, seasons, guests] = await Promise.all([
    prisma.arenaShow.findUnique({
      where: { id },
      include: { guests: true },
    }),
    prisma.arenaSeason.findMany({ orderBy: [{ year: "desc" }, { number: "desc" }] }),
    prisma.arenaGuest.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!show) notFound();

  return (
    <div>
      <AdminPageIntro
        title={`Éditer · ${show.title}`}
        hint="Mettez à jour l’affiche, la vidéo ou les invités, puis Enregistrer."
      />
      <ArenaShowForm show={show} seasons={seasons} guests={guests} />
    </div>
  );
}
