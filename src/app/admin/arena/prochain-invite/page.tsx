import { ArenaAdminNav } from "@/components/admin/ArenaAdminNav";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { NextGuestAnnounceForm } from "@/components/admin/NextGuestAnnounceForm";
import { getArenaStage } from "@/lib/data";
import { arenaSpotlightGuest } from "@/lib/arena-spotlight";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Prochain invité" };
export const dynamic = "force-dynamic";

export default async function AdminNextGuestPage() {
  const [stage, guests] = await Promise.all([
    getArenaStage(),
    prisma.arenaGuest.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, photo: true, profession: true },
    }),
  ]);
  const spotlight = stage.announced;
  const guest = arenaSpotlightGuest(spotlight);

  return (
    <div>
      <AdminPageIntro
        title="Prochain invité"
        hint="Ici, on n’écrit pas la fiche. On choisit quelqu’un déjà créé, on ajoute l’affiche d’émission, et ça s’affiche sur l’accueil sous « Prochain invité »."
        actions={[
          {
            href: "/",
            label: "Voir l’accueil",
            hint: "Ouvre la page principale",
            target: "_blank",
          },
          {
            href: "/admin/arena/guests",
            label: "1. Créer une fiche",
            hint: "Nom, photo, bio — obligatoire avant d’annoncer",
            variant: guests.length ? "ghost" : "primary",
          },
        ]}
      />
      <ArenaAdminNav current="/admin/arena/prochain-invite" />
      <NextGuestAnnounceForm
        guests={guests}
        current={
          spotlight
            ? {
                id: spotlight.id,
                title: spotlight.title,
                poster: spotlight.poster,
                theme: spotlight.theme,
                airDate: spotlight.airDate ? spotlight.airDate.toISOString() : "",
                airTime: spotlight.airTime,
                status: spotlight.status,
                guestId: guest?.id || spotlight.guests[0]?.guestId || null,
                guestName: guest?.name || null,
              }
            : null
        }
      />
    </div>
  );
}
