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
  const [show, seasons, guests, events] = await Promise.all([
    prisma.arenaShow.findUnique({
      where: { id },
      include: { guests: true },
    }),
    prisma.arenaSeason.findMany({ orderBy: [{ year: "desc" }, { number: "desc" }] }),
    prisma.arenaGuest.findMany({ orderBy: { name: "asc" } }),
    prisma.event.findMany({
      where: { status: { in: ["PUBLISHED", "SOLD_OUT", "ENDED"] } },
      select: { id: true, title: true, startsAt: true, status: true },
      orderBy: { startsAt: "desc" },
      take: 80,
    }),
  ]);
  if (!show) notFound();

  return (
    <div>
      <AdminPageIntro
        title={`Éditer · ${show.title}`}
        hint="Annoncer le prochain invité ou publier à la une. Lie un événement pour les billets du calendrier."
      />
      <ArenaAdminNav current="/admin/arena/emissions" />
      <ArenaShowForm show={show} seasons={seasons} guests={guests} events={events} />
    </div>
  );
}
