import Link from "next/link";
import { deleteArenaShow, setArenaShowStatus } from "@/actions/admin/arena";
import { ArenaAdminNav } from "@/components/admin/ArenaAdminNav";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { prisma } from "@/lib/prisma";
import { formatViews } from "@/lib/page-views";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Arena Culture" };

export default async function AdminArenaPage() {
  const [shows, publishedGuests, videos, albums] = await Promise.all([
    prisma.arenaShow.findMany({
      include: { season: true, guests: { include: { guest: true } } },
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
        title="Arena Culture"
        hint="Gérez l’émission spéciale : publiez les épisodes, les invités et les vidéos (avec miniature) pour le site."
        actions={
          <Link href="/admin/arena/new" className="admin-btn admin-btn-primary">
            Nouvelle émission
          </Link>
        }
      />
      <ArenaAdminNav current="/admin/arena" />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Émissions publiées", value: published, href: "/admin/arena" },
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

      <div className="admin-card overflow-x-auto p-0">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Titre</th>
              <th>Saison</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Vues</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shows.map((s) => (
              <tr key={s.id}>
                <td>{s.number}</td>
                <td>
                  <Link href={`/admin/arena/${s.id}`} className="font-medium hover:underline">
                    {s.title}
                  </Link>
                  {s.isFeatured || s.isGuestOfWeek ? (
                    <p className="text-xs text-[#9aa3b5]">
                      {[s.isFeatured ? "À la une" : null, s.isGuestOfWeek ? "Invité semaine" : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  ) : null}
                </td>
                <td>{s.season ? `S${s.season.number}` : "—"}</td>
                <td className="whitespace-nowrap text-[#aeb6c5]">
                  {formatDate(s.airDate, "d MMM yyyy") || "—"}
                </td>
                <td>
                  <StatusBadge status={s.status} />
                </td>
                <td className="whitespace-nowrap text-[#aeb6c5]">{formatViews(s.views)}</td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    <Link href={`/admin/arena/${s.id}`} className="admin-btn admin-btn-ghost text-xs">
                      Éditer
                    </Link>
                    {s.status !== "PUBLISHED" ? (
                      <form action={setArenaShowStatus}>
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="status" value="PUBLISHED" />
                        <button type="submit" className="admin-btn admin-btn-ghost text-xs">
                          Publier
                        </button>
                      </form>
                    ) : (
                      <form action={setArenaShowStatus}>
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="status" value="DRAFT" />
                        <button type="submit" className="admin-btn admin-btn-ghost text-xs">
                          Dépublier
                        </button>
                      </form>
                    )}
                    <form action={deleteArenaShow}>
                      <input type="hidden" name="id" value={s.id} />
                      <button type="submit" className="admin-btn admin-btn-danger text-xs">
                        Suppr.
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {!shows.length ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#9aa3b5]">
                  Aucune émission.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
