import Link from "next/link";
import { GuestsManager } from "@/components/admin/GuestsManager";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Invités Arena" };

export default async function AdminArenaGuestsPage() {
  const guests = await prisma.arenaGuest.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold">Invités Arena</h1>
        <Link href="/admin/arena" className="admin-btn admin-btn-ghost">
          Émissions
        </Link>
      </div>
      <GuestsManager guests={guests} />
    </div>
  );
}
