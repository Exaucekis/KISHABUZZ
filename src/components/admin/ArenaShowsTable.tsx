import Link from "next/link";
import { archiveArenaShow, deleteArenaShow, setArenaShowStatus } from "@/actions/admin/arena";
import { AdminConfirmForm } from "@/components/admin/AdminConfirmForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatViews } from "@/lib/page-views";
import { formatDate } from "@/lib/utils";

type ShowRow = {
  id: string;
  number: number;
  title: string;
  status: string;
  airDate: Date | null;
  views: number;
  isFeatured: boolean;
  isGuestOfWeek: boolean;
  season: { number: number } | null;
};

export function ArenaShowsTable({
  shows,
  inArchive = false,
}: {
  shows: ShowRow[];
  inArchive?: boolean;
}) {
  return (
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
                    {[
                      s.isFeatured ? "Vidéo à la une" : null,
                      s.isGuestOfWeek ? "Prochain invité" : null,
                    ]
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
                    Modifier
                  </Link>
                  {!inArchive && s.status !== "PUBLISHED" ? (
                    <form action={setArenaShowStatus}>
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="status" value="PUBLISHED" />
                      <button type="submit" className="admin-btn admin-btn-ghost text-xs">
                        Mettre en première
                      </button>
                    </form>
                  ) : null}
                  {inArchive || s.status === "ARCHIVED" ? (
                    <AdminConfirmForm
                      action={deleteArenaShow}
                      label="Supprimer"
                      title="Retirer définitivement des archives ?"
                      description="Le public ne verra plus cet épisode dans les archives. Cette action est irréversible."
                      confirmLabel="Oui, retirer"
                    >
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="next" value="/admin/arena/archives" />
                    </AdminConfirmForm>
                  ) : (
                    <AdminConfirmForm
                      action={archiveArenaShow}
                      label="Supprimer"
                      title="Envoyer aux archives ?"
                      description="L’émission quitte l’accueil et Arena. Elle reste visible dans Archives jusqu’à ce que vous la retiriez."
                      confirmLabel="Oui, archiver"
                    >
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="next" value="/admin/arena/archives" />
                    </AdminConfirmForm>
                  )}
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
  );
}
