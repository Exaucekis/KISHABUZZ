import Link from "next/link";
import { deleteNewsletterSubscriber, setNewsletterStatus } from "@/actions/admin/newsletter";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Newsletter" };

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminNewsletterPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const [subscribers, activeCount] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
    }),
    prisma.newsletterSubscriber.count({ where: { status: "ACTIVE" } }),
  ]);

  return (
    <div>
      <AdminPageIntro
        title="Newsletter"
        hint={`${activeCount} abonné${activeCount > 1 ? "s" : ""} actif${activeCount > 1 ? "s" : ""}. Exportez le CSV pour un envoi depuis votre outil mail.`}
        actions={
          <a href="/api/admin/newsletter" className="admin-btn admin-btn-primary">
            Exporter CSV
          </a>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {[
          ["", "Tous"],
          ["ACTIVE", "Actifs"],
          ["UNSUBSCRIBED", "Désinscrits"],
        ].map(([value, label]) => (
          <Link
            key={label}
            href={value ? `/admin/newsletter?status=${value}` : "/admin/newsletter"}
            className="admin-btn admin-btn-ghost text-xs"
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="admin-card overflow-x-auto p-0">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Statut</th>
              <th>Source</th>
              <th>Inscrit le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((row) => (
              <tr key={row.id}>
                <td>
                  <a href={`mailto:${row.email}`} className="hover:underline">
                    {row.email}
                  </a>
                </td>
                <td>
                  <StatusBadge status={row.status} />
                </td>
                <td className="text-[#aeb6c5]">{row.source}</td>
                <td className="whitespace-nowrap text-[#aeb6c5]">
                  {formatDate(row.createdAt, "d MMM yyyy HH:mm")}
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {row.status === "ACTIVE" ? (
                      <form action={setNewsletterStatus}>
                        <input type="hidden" name="id" value={row.id} />
                        <input type="hidden" name="status" value="UNSUBSCRIBED" />
                        <button type="submit" className="admin-btn admin-btn-ghost text-xs">
                          Désinscrire
                        </button>
                      </form>
                    ) : (
                      <form action={setNewsletterStatus}>
                        <input type="hidden" name="id" value={row.id} />
                        <input type="hidden" name="status" value="ACTIVE" />
                        <button type="submit" className="admin-btn admin-btn-ghost text-xs">
                          Réactiver
                        </button>
                      </form>
                    )}
                    <form action={deleteNewsletterSubscriber}>
                      <input type="hidden" name="id" value={row.id} />
                      <button type="submit" className="admin-btn admin-btn-danger text-xs">
                        Suppr.
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {!subscribers.length ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[#9aa3b5]">
                  Aucun abonné.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
