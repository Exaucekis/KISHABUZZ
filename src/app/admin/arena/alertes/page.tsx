import Link from "next/link";
import {
  deleteArenaAlertSubscriber,
  resendArenaAlert,
  setArenaAlertStatus,
} from "@/actions/admin/arena-alerts";
import { ArenaAdminNav } from "@/components/admin/ArenaAdminNav";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { isMailerConfigured, mailerSetupHint } from "@/lib/mailer";
import { formatWhatsAppDisplay } from "@/lib/phone";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { isWhatsAppConfigured, whatsappSetupHint } from "@/lib/whatsapp";

export const metadata = { title: "Alertes Arena" };
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminArenaAlertsPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const [subscribers, emailCount, whatsappCount, dispatches] = await Promise.all([
    prisma.arenaAlertSubscriber.findMany({
      where: status
        ? {
            OR: [{ emailStatus: status }, { whatsappStatus: status }],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
    }),
    prisma.arenaAlertSubscriber.count({ where: { emailStatus: "ACTIVE" } }),
    prisma.arenaAlertSubscriber.count({ where: { whatsappStatus: "ACTIVE" } }),
    prisma.arenaAlertDispatch.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { show: { select: { id: true, title: true, number: true } } },
    }),
  ]);

  const mailerReady = isMailerConfigured();
  const whatsappReady = isWhatsAppConfigured();

  return (
    <div>
      <AdminPageIntro
        title="Alertes Arena"
        hint="Quand une émission passe en « Annoncer le prochain invité » ou « Publier à la une », les abonnés reçoivent un email et/ou un WhatsApp. Un seul envoi par émission et par type."
        actions={
          <a href="/api/admin/arena-alerts" className="admin-btn admin-btn-primary">
            Exporter CSV
          </a>
        }
      />
      <ArenaAdminNav current="/admin/arena/alertes" />

      <div className="mb-6 grid gap-3 md:grid-cols-2">
        <div className="admin-card">
          <p className="text-xs uppercase tracking-wide text-[#9aa3b5]">Emails actifs</p>
          <p className="mt-1 text-2xl font-semibold">{emailCount}</p>
          <p className="mt-2 text-sm text-[#aeb6c5]">
            {mailerReady ? "Resend prêt." : mailerSetupHint()}
          </p>
        </div>
        <div className="admin-card">
          <p className="text-xs uppercase tracking-wide text-[#9aa3b5]">WhatsApp actifs</p>
          <p className="mt-1 text-2xl font-semibold">{whatsappCount}</p>
          <p className="mt-2 text-sm text-[#aeb6c5]">
            {whatsappReady ? "API Cloud WhatsApp prête." : whatsappSetupHint()}
          </p>
        </div>
      </div>

      {dispatches.length ? (
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#9aa3b5]">
            Derniers envois
          </h2>
          <div className="admin-card overflow-x-auto p-0">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Émission</th>
                  <th>Type</th>
                  <th>Résultat</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {dispatches.map((row) => (
                  <tr key={row.id}>
                    <td className="whitespace-nowrap text-[#aeb6c5]">
                      {formatDate(row.createdAt, "d MMM yyyy HH:mm")}
                    </td>
                    <td>
                      <Link href={`/admin/arena/${row.show.id}`} className="hover:underline">
                        #{row.show.number} · {row.show.title}
                      </Link>
                      {row.errorNote ? (
                        <p className="mt-1 max-w-sm text-xs text-red-300">{row.errorNote}</p>
                      ) : null}
                    </td>
                    <td>
                      <StatusBadge status={row.kind} />
                    </td>
                    <td>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={row.status} />
                        <span className="text-xs text-[#9aa3b5]">
                          {row.emailSent} email · {row.whatsappSent} WA
                          {row.emailFailed + row.whatsappFailed
                            ? ` · ${row.emailFailed + row.whatsappFailed} échec`
                            : ""}
                        </span>
                      </div>
                    </td>
                    <td>
                      <form action={resendArenaAlert}>
                        <input type="hidden" name="showId" value={row.showId} />
                        <input type="hidden" name="kind" value={row.kind} />
                        <button type="submit" className="admin-btn admin-btn-ghost text-xs">
                          Renvoyer
                        </button>
                      </form>
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
            href={value ? `/admin/arena/alertes?status=${value}` : "/admin/arena/alertes"}
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
              <th>WhatsApp</th>
              <th>Source</th>
              <th>Inscrit le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((row) => (
              <tr key={row.id}>
                <td>
                  {row.email ? (
                    <>
                      <a href={`mailto:${row.email}`} className="hover:underline">
                        {row.email}
                      </a>
                      <div className="mt-1">
                        <StatusBadge status={row.emailStatus} />
                      </div>
                    </>
                  ) : (
                    <span className="text-[#9aa3b5]">—</span>
                  )}
                </td>
                <td>
                  {row.whatsapp ? (
                    <>
                      <span>{formatWhatsAppDisplay(row.whatsapp)}</span>
                      <div className="mt-1">
                        <StatusBadge status={row.whatsappStatus} />
                      </div>
                    </>
                  ) : (
                    <span className="text-[#9aa3b5]">—</span>
                  )}
                </td>
                <td className="text-[#aeb6c5]">{row.source}</td>
                <td className="whitespace-nowrap text-[#aeb6c5]">
                  {formatDate(row.createdAt, "d MMM yyyy HH:mm")}
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {row.emailStatus === "ACTIVE" ? (
                      <form action={setArenaAlertStatus}>
                        <input type="hidden" name="id" value={row.id} />
                        <input type="hidden" name="channel" value="email" />
                        <input type="hidden" name="status" value="UNSUBSCRIBED" />
                        <button type="submit" className="admin-btn admin-btn-ghost text-xs">
                          Stop email
                        </button>
                      </form>
                    ) : row.email ? (
                      <form action={setArenaAlertStatus}>
                        <input type="hidden" name="id" value={row.id} />
                        <input type="hidden" name="channel" value="email" />
                        <input type="hidden" name="status" value="ACTIVE" />
                        <button type="submit" className="admin-btn admin-btn-ghost text-xs">
                          Email on
                        </button>
                      </form>
                    ) : null}
                    {row.whatsappStatus === "ACTIVE" ? (
                      <form action={setArenaAlertStatus}>
                        <input type="hidden" name="id" value={row.id} />
                        <input type="hidden" name="channel" value="whatsapp" />
                        <input type="hidden" name="status" value="UNSUBSCRIBED" />
                        <button type="submit" className="admin-btn admin-btn-ghost text-xs">
                          Stop WA
                        </button>
                      </form>
                    ) : row.whatsapp ? (
                      <form action={setArenaAlertStatus}>
                        <input type="hidden" name="id" value={row.id} />
                        <input type="hidden" name="channel" value="whatsapp" />
                        <input type="hidden" name="status" value="ACTIVE" />
                        <button type="submit" className="admin-btn admin-btn-ghost text-xs">
                          WA on
                        </button>
                      </form>
                    ) : null}
                    <form action={deleteArenaAlertSubscriber}>
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
                  Aucun abonné alerte. Le formulaire est en bas des pages Arena Culture.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
