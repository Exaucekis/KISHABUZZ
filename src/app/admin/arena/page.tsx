import { ArenaAdminNav } from "@/components/admin/ArenaAdminNav";
import { ArenaHomeDashboard } from "@/components/admin/ArenaHomeDashboard";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { getArenaHome, getArenaStage } from "@/lib/data";
import { arenaSpotlightGuest } from "@/lib/arena-spotlight";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Arena Culture" };
export const dynamic = "force-dynamic";

export default async function AdminArenaDashboardPage() {
  const [home, stage, guests, shows, albums, archivedCount] = await Promise.all([
    getArenaHome(),
    getArenaStage(),
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
      select: { id: true, title: true, poster: true, videoThumbnail: true },
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
        hint="Un onglet = une rubrique. À la une, Prochain invité et Émissions ont chacun leur formulaire. Les épisodes se créent dans l’onglet Émissions."
        actions={[
          {
            href: "/arena-culture",
            label: "Voir la page",
            hint: "Ouvre /arena-culture",
            target: "_blank",
          },
          {
            href: "/admin/arena/emissions",
            label: "Émissions",
            hint: "Invité, domaine et vidéo",
            variant: "primary",
          },
        ]}
      />
      <ArenaAdminNav current="/admin/arena" />
      <ArenaHomeDashboard
        home={home}
        live={{
          headline: stage.headline
            ? {
                id: stage.headline.id,
                title: stage.headline.title,
                status: stage.headline.status,
                poster: stage.headline.poster,
                guestName: arenaSpotlightGuest(stage.headline)?.name || null,
                hasVideo: Boolean(String(stage.headline.videoUrl || "").trim()),
              }
            : null,
          announced: stage.announced
            ? {
                id: stage.announced.id,
                title: stage.announced.title,
                status: stage.announced.status,
                poster: stage.announced.poster,
                guestName: arenaSpotlightGuest(stage.announced)?.name || null,
              }
            : null,
          guests,
          shows: shows.map((show) => ({
            id: show.id,
            title: show.title,
            poster: show.poster,
            videoThumbnail: show.videoThumbnail,
          })),
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
