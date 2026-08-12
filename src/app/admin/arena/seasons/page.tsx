import Link from "next/link";
import { SeasonsManager } from "@/components/admin/SeasonsManager";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Saisons Arena" };

export default async function AdminArenaSeasonsPage() {
  const seasons = await prisma.arenaSeason.findMany({
    orderBy: [{ year: "desc" }, { number: "desc" }],
  });
  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold">Saisons Arena</h1>
        <Link href="/admin/arena" className="admin-btn admin-btn-ghost">
          Émissions
        </Link>
      </div>
      <SeasonsManager seasons={seasons} />
    </div>
  );
}
