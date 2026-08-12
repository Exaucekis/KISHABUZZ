import Link from "next/link";
import { deleteContact, updateContactStatus } from "@/actions/admin/contacts";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { prisma } from "@/lib/prisma";
import { collaborationLabel, formatDate } from "@/lib/utils";

export const metadata = { title: "Contacts" };

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminContactsPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const contacts = await prisma.contactRequest.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold">Demandes de contact</h1>
      <div className="mt-4 mb-5 flex flex-wrap gap-2">
        {[
          ["", "Tous"],
          ["NEW", "Nouveaux"],
          ["IN_PROGRESS", "En cours"],
          ["DONE", "Traités"],
          ["ARCHIVED", "Archivés"],
        ].map(([value, label]) => (
          <Link
            key={label}
            href={value ? `/admin/contacts?status=${value}` : "/admin/contacts"}
            className="admin-btn admin-btn-ghost text-xs"
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {contacts.map((c) => (
          <article key={c.id} className="admin-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <StatusBadge status={c.status} />
                  <span className="text-xs text-[#9aa3b5]">
                    {formatDate(c.createdAt, "d MMM yyyy HH:mm")}
                  </span>
                </div>
                <h2 className="text-lg font-semibold">{c.subject}</h2>
                <p className="text-sm text-[#aeb6c5]">
                  {c.name}
                  {c.organization ? ` · ${c.organization}` : ""} · {c.email}
                  {c.phone ? ` · ${c.phone}` : ""}
                </p>
                <p className="mt-1 text-xs uppercase tracking-wide text-[#9aa3b5]">
                  {collaborationLabel(c.collaborationType)}
                </p>
              </div>
              <form action={deleteContact}>
                <input type="hidden" name="id" value={c.id} />
                <button type="submit" className="admin-btn admin-btn-danger text-xs">
                  Suppr.
                </button>
              </form>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#d5dae3]">
              {c.message}
            </p>
            <form action={updateContactStatus} className="mt-4 flex flex-wrap items-end gap-2">
              <input type="hidden" name="id" value={c.id} />
              <div className="admin-field mb-0 min-w-[180px]">
                <label>Statut</label>
                <select name="status" defaultValue={c.status}>
                  <option value="NEW">Nouveau</option>
                  <option value="IN_PROGRESS">En cours</option>
                  <option value="DONE">Traité</option>
                  <option value="ARCHIVED">Archivé</option>
                </select>
              </div>
              <button type="submit" className="admin-btn admin-btn-primary">
                Mettre à jour
              </button>
            </form>
          </article>
        ))}
        {!contacts.length ? <p className="text-sm text-[#9aa3b5]">Aucune demande.</p> : null}
      </div>
    </div>
  );
}
