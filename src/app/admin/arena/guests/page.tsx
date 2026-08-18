import Link from "next/link";
import { ArenaAdminNav } from "@/components/admin/ArenaAdminNav";
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
        hint="Créez l’invité, ajoutez photo et bio, puis publiez. Il apparaît sur le site et peut être lié à une émission."
        actions={
          <a href="/arena-culture/invites" className="admin-btn admin-btn-ghost" target="_blank" rel="noreferrer">
            Voir la page
          </a>
        }
      />
      <ArenaAdminNav current="/admin/arena/guests" />
      <GuestsManager guests={guests} />
    </div>
  );
}
