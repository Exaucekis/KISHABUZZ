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
        title="Fiches invités"
        hint="C’est le carnet : nom, portrait, métier, bio. Créer une fiche ne la met pas encore sur l’accueil. Pour ça, allez ensuite dans Prochain invité et ajoutez l’affiche."
        actions={[
          {
            href: "/admin/arena/prochain-invite",
            label: "2. Annoncer sur l’accueil",
            hint: "Choisir la fiche + affiche d’émission",
            variant: guests.length ? "primary" : "ghost",
          },
          {
            href: "/arena-culture",
            label: "Voir l’accueil Arena",
            hint: "Bloc Prochain invité",
            target: "_blank",
          },
        ]}
      />
      <ArenaAdminNav current="/admin/arena/guests" />
      <GuestsManager guests={guests} />
    </div>
  );
}
