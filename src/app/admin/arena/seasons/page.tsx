import Link from "next/link";
import { SeasonsManager } from "@/components/admin/SeasonsManager";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Saisons Arena" };

export default async function AdminArenaSeasonsPage() {
  const seasons = await prisma.arenaSeason.findMany({
    orderBy: [{ year: "desc" }, { number: "desc" }],
  });
  return (
    <div>
      <AdminPageIntro
        title="Saisons Arena"
        hint="Créez une saison (année + numéro), puis rattachez-y les émissions."
        actions={
          <Link href="/admin/arena" className="admin-btn admin-btn-ghost">
            Émissions
          </Link>
        }
      />
      <SeasonsManager seasons={seasons} />
    </div>
  );
}
