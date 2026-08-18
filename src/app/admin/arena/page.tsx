import Link from "next/link";
import { deleteArenaShow, setArenaShowStatus } from "@/actions/admin/arena";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { prisma } from "@/lib/prisma";
import { formatViews } from "@/lib/page-views";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Arena Culture" };

export default async function AdminArenaPage() {
  const shows = await prisma.arenaShow.findMany({
    include: { season: true, guests: { include: { guest: true } } },
    orderBy: [{ number: "desc" }, { airDate: "desc" }],
  });

  return (
    <div>
      <AdminPageIntro
        title="Arena Culture"
        hint="Liste des émissions. Publiez une émission pour qu’elle apparaisse sur le site."
        actions={
          <>
            <Link href="/admin/arena/guests" className="admin-btn admin-btn-ghost">
              Invités
            </Link>
            <Link href="/admin/arena/seasons" className="admin-btn admin-btn-ghost">
              Saisons
            </Link>
            <Link href="/admin/arena/new" className="admin-btn admin-btn-primary">
              Nouvelle émission
            </Link>
          </>
        }
      />

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
