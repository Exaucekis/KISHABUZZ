import Link from "next/link";
import { ArenaAdminNav } from "@/components/admin/ArenaAdminNav";
import { ArenaVideosManager } from "@/components/admin/ArenaVideosManager";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Vidéos Arena" };

export default async function AdminArenaVideosPage() {
  const [videos, shows] = await Promise.all([
    prisma.mediaAsset.findMany({
      where: {
        kind: "VIDEO",
        OR: [{ category: "ARENA_CULTURE" }, { arenaShowId: { not: null } }],
        NOT: { title: { startsWith: "Archive ·" } },
      },
      orderBy: [{ featured: "desc" }, { date: "desc" }, { createdAt: "desc" }],
    }),
    prisma.arenaShow.findMany({
      select: { id: true, title: true, number: true },
      orderBy: [{ number: "desc" }, { airDate: "desc" }],
    }),
  ]);

  return (
    <div>
      <AdminPageIntro
        title="Vidéos Arena"
        hint="Téléversez un MP4 ou collez un lien YouTube / Facebook / Instagram / TikTok. « Vidéo à la une » + émission liée = première place ; l’ancienne vidéo part aux archives."
        actions={
          <a href="/arena-culture/videos" className="admin-btn admin-btn-ghost" target="_blank" rel="noreferrer">
            Voir la page
          </a>
        }
      />
      <ArenaAdminNav current="/admin/arena/videos" />
      <ArenaVideosManager videos={videos} shows={shows} />
    </div>
  );
}
