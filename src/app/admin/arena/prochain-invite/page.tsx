import { ArenaAdminNav } from "@/components/admin/ArenaAdminNav";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { NextGuestAnnounceForm } from "@/components/admin/NextGuestAnnounceForm";
import { getArenaSpotlight } from "@/lib/data";
import { arenaSpotlightGuest } from "@/lib/arena-spotlight";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Prochain invité" };
export const dynamic = "force-dynamic";

export default async function AdminNextGuestPage() {
  const [spotlight, guests] = await Promise.all([
    getArenaSpotlight(),
    prisma.arenaGuest.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, photo: true, profession: true },
    }),
  ]);
  const guest = arenaSpotlightGuest(spotlight);

  return (
    <div>
      <AdminPageIntro
        title="Prochain invité"
        hint="Annoncez l’invité ici : le nom et l’affiche s’affichent tout de suite sur l’accueil et Arena Culture. Un nouvel invité envoie l’ancien aux archives."
        actions={[
          {
            href: "/",
            label: "Voir l’accueil",
            hint: "Ouvre la page principale",
            target: "_blank",
          },
          {
            href: "/admin/arena/guests",
            label: "Fiches invités",
            hint: "Portraits et bios",
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
