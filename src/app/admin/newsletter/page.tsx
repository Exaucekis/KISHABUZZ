import Link from "next/link";
import { deleteNewsletterSubscriber, setNewsletterStatus } from "@/actions/admin/newsletter";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { NewsletterCompose } from "@/components/admin/NewsletterCompose";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { isMailerConfigured, mailerSetupHint } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Newsletter" };
export const maxDuration = 60;

type Props = { searchParams: Promise<{ status?: string; to?: string }> };

export default async function AdminNewsletterPage({ searchParams }: Props) {
  const { status, to } = await searchParams;
  const [subscribers, activeCount, campaigns] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
    }),
    prisma.newsletterSubscriber.count({ where: { status: "ACTIVE" } }),
    prisma.newsletterCampaign.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  return (
    <div>
      <AdminPageIntro
        title="Newsletter"
        hint="Envoyez une newsletter ou une notification aux emails récoltés, ou à des destinataires précis. Chaque envoi apparaît dans l’historique et dans la cloche de l’admin."
        actions={
          <a href="/api/admin/newsletter" className="admin-btn admin-btn-primary">
            Exporter CSV
          </a>
        }
      />

      <div className="mb-6">
        <NewsletterCompose
          activeCount={activeCount}
          mailerReady={isMailerConfigured()}
          mailerHint={mailerSetupHint()}
          defaultTo={to || ""}
        />
      </div>

      {campaigns.length ? (
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#9aa3b5]">
            Derniers envois
          </h2>
          <div className="admin-card overflow-x-auto p-0">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Sujet</th>
                  <th>Audience</th>
                  <th>Résultat</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((row) => (
                  <tr key={row.id}>
                    <td className="whitespace-nowrap text-[#aeb6c5]">
                      {formatDate(row.createdAt, "d MMM yyyy HH:mm")}
                    </td>
                    <td>
                      <StatusBadge status={row.kind} />
                    </td>
                    <td>
                      <p>{row.subject}</p>
                      {row.errorNote ? (
                        <p className="mt-1 max-w-sm text-xs text-red-300">{row.errorNote}</p>
                      ) : null}
                    </td>
                    <td className="text-[#aeb6c5]">
                      {row.audience === "ALL" ? "Tous les actifs" : row.recipients || "Personnalisé"}
                    </td>
                    <td>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={row.status} />
                        <span className="text-xs text-[#9aa3b5]">
                          {row.sentCount} ok · {row.failCount} échec{row.failCount > 1 ? "s" : ""}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

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
                    <Link
                      href={`/admin/newsletter?to=${encodeURIComponent(row.email)}`}
                      className="admin-btn admin-btn-ghost text-xs"
                    >
                      Écrire
                    </Link>
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
