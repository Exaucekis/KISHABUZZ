import Link from "next/link";
import { GuestsManager } from "@/components/admin/GuestsManager";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Invités Arena" };

export default async function AdminArenaGuestsPage() {
  const guests = await prisma.arenaGuest.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <AdminPageIntro
        title="Invités Arena"
        hint="Créez l’invité (nom + photo) avant de le cocher dans une émission."
        actions={
          <Link href="/admin/arena" className="admin-btn admin-btn-ghost">
            Émissions
          </Link>
        }
      />
      <GuestsManager guests={guests} />
    </div>
  );
}
