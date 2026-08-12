import { notFound } from "next/navigation";
import { ArenaShowForm } from "@/components/admin/ArenaShowForm";
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
      <h1 className="mb-5 font-[family-name:var(--font-syne)] text-2xl font-bold">
        Éditer · {show.title}
      </h1>
      <ArenaShowForm show={show} seasons={seasons} guests={guests} />
    </div>
  );
}
