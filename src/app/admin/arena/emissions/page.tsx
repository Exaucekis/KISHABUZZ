import Link from "next/link";
import { ArenaAdminNav } from "@/components/admin/ArenaAdminNav";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { ArenaShowsTable } from "@/components/admin/ArenaShowsTable";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Émissions Arena" };

export default async function AdminArenaShowsPage() {
  const [shows, publishedGuests, videos, albums] = await Promise.all([
    prisma.arenaShow.findMany({
      include: { season: true },
      orderBy: [{ number: "desc" }, { airDate: "desc" }],
    }),
    prisma.arenaGuest.count({ where: { visible: true } }),
    prisma.mediaAsset.count({
      where: { kind: "VIDEO", OR: [{ category: "ARENA_CULTURE" }, { arenaShowId: { not: null } }] },
    }),
    prisma.photoAlbum.count({ where: { visible: true } }),
  ]);

  const published = shows.filter((s) => s.status === "PUBLISHED").length;

  return (
    <div>
      <AdminPageIntro
        title="Émissions Arena"
        hint="Nouvelle émission : titre, nom de l’artiste, vidéo + miniature (pas d’affiche). Le prochain invité reste en dessous."
        actions={
          <Link href="/admin/arena/new" className="admin-btn admin-btn-primary">
            Nouvelle émission
          </Link>
        }
      />
      <ArenaAdminNav current="/admin/arena/emissions" />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Émissions publiées", value: published, href: "/admin/arena/emissions" },
          { label: "Invités publiés", value: publishedGuests, href: "/admin/arena/guests" },
          { label: "Vidéos", value: videos, href: "/admin/arena/videos" },
          { label: "Albums", value: albums, href: "/admin/arena/albums" },
        ].map((card) => (
          <Link key={card.label} href={card.href} className="admin-card block hover:border-white/20">
            <p className="text-xs uppercase tracking-wide text-[#9aa3b5]">{card.label}</p>
            <p className="mt-2 text-2xl font-bold tabular-nums">{card.value}</p>
          </Link>
        ))}
      </div>

      <ArenaShowsTable shows={shows} />
    </div>
  );
}
