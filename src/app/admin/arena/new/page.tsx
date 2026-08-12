import { ArenaShowForm } from "@/components/admin/ArenaShowForm";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Nouvelle émission" };

export default async function NewArenaShowPage() {
  const [seasons, guests] = await Promise.all([
    prisma.arenaSeason.findMany({ orderBy: [{ year: "desc" }, { number: "desc" }] }),
    prisma.arenaGuest.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-5 font-[family-name:var(--font-syne)] text-2xl font-bold">
        Nouvelle émission Arena
      </h1>
      <ArenaShowForm seasons={seasons} guests={guests} />
    </div>
  );
}
