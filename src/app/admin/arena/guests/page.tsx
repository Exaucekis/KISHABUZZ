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
        hint="Créez l’invité, ajoutez photo et bio, puis publiez. Pour l’afficher sur l’accueil, ouvrez Prochain invité."
        actions={[
          {
            href: "/admin/arena/prochain-invite",
            label: "Prochain invité",
            hint: "Annoncer sur l’accueil",
            variant: "primary",
          },
          {
            href: "/arena-culture/invites",
            label: "Voir la page",
            hint: "Ouvre /arena-culture/invites",
            target: "_blank",
          },
        ]}
      />
      <ArenaAdminNav current="/admin/arena/guests" />
      <GuestsManager guests={guests} />
    </div>
  );
}
