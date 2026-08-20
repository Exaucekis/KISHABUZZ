import { ArenaAdminNav } from "@/components/admin/ArenaAdminNav";
import { ArenaHomeDashboard } from "@/components/admin/ArenaHomeDashboard";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { getArenaHome, getArenaSpotlight } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Arena Culture" };
export const dynamic = "force-dynamic";

export default async function AdminArenaDashboardPage() {
  const [home, spotlight, guests, shows, albums, archivedCount] = await Promise.all([
    getArenaHome(),
    getArenaSpotlight(),
    prisma.arenaGuest.findMany({
      where: { visible: true },
      orderBy: [{ featured: "desc" }, { name: "asc" }],
      take: 8,
      select: { id: true, name: true, photo: true },
    }),
    prisma.arenaShow.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ number: "desc" }, { airDate: "desc" }],
      take: 8,
      select: { id: true, title: true, poster: true },
    }),
    prisma.photoAlbum.findMany({
      where: { visible: true },
      orderBy: [{ order: "asc" }, { date: "desc" }],
      take: 6,
      select: { slug: true, title: true, coverImage: true, guestName: true },
    }),
    prisma.arenaShow.count({ where: { status: "ARCHIVED" } }),
  ]);

  return (
    <div>
      <AdminPageIntro
        title="Page Arena Culture"
        hint="Un onglet = une rubrique de /arena-culture. Enregistrez avant de changer d’onglet. Un visuel remplacé part aux archives."
        actions={[
          {
            href: "/arena-culture",
            label: "Voir la page",
            hint: "Ouvre /arena-culture",
            target: "_blank",
          },
          {
            href: "/admin/arena/new",
            label: "Nouvelle émission",
            hint: "Créer un épisode (pas une rubrique)",
            variant: "primary",
          },
        ]}
      />
      <ArenaAdminNav current="/admin/arena" />
      <ArenaHomeDashboard
        home={home}
        live={{
          spotlight: spotlight
            ? {
                id: spotlight.id,
                title: spotlight.title,
                status: spotlight.status,
                poster: spotlight.poster,
                guestName: spotlight.guests[0]?.guest.name || null,
              }
            : null,
          guests,
          shows,
          albums: albums.map((album) => ({
            slug: album.slug,
            title: album.guestName || album.title,
            cover: album.coverImage,
          })),
          archivedCount,
        }}
      />
    </div>
  );
}
