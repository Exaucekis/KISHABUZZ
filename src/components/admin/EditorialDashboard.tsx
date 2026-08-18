import Link from "next/link";
import type { ReactNode } from "react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { articleEditPath, articlePreviewPath } from "@/lib/article-paths";
import { articleTypeLabel } from "@/lib/editorial-dashboard";
import { formatDate } from "@/lib/utils";

type Draft = {
  id: string;
  title: string;
  slug: string;
  contentType: string;
  updatedAt: Date;
};

type Scheduled = Draft & { scheduledAt: Date | null };

type Contact = {
  id: string;
  name: string;
  subject: string;
  createdAt: Date;
};

type Show = {
  id: string;
  title: string;
  status: string;
  airDate: Date | null;
  guests: { guest: { name: string } }[];
};

function QueueCard({
  title,
  href,
  empty,
  children,
}: {
  title: string;
  href: string;
  empty: string;
  children: ReactNode;
}) {
  return (
    <section className="admin-card">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#9aa3b5]">{title}</h2>
        <Link href={href} className="text-xs text-[#9aa3b5] hover:text-white">
          Tout voir
        </Link>
      </div>
      {children || <p className="text-sm text-[#9aa3b5]">{empty}</p>}
    </section>
  );
}

export function EditorialDashboard({
  drafts,
  scheduled,
  contacts,
  latestShow,
}: {
  drafts: Draft[];
  scheduled: Scheduled[];
  contacts: Contact[];
  latestShow: Show | null;
}) {
  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <QueueCard title="Brouillons" href="/admin/articles?status=DRAFT" empty="Aucun brouillon.">
        {drafts.length ? (
          <ul className="space-y-3">
            {drafts.map((article) => (
              <li key={article.id} className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={articleEditPath(article.id)} className="font-medium hover:underline">
                    {article.title}
                  </Link>
                  <p className="text-xs text-[#9aa3b5]">
                    {articleTypeLabel(article.contentType)} ·{" "}
                    {formatDate(article.updatedAt, "d MMM yyyy")}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Link href={articleEditPath(article.id)} className="admin-btn admin-btn-ghost text-xs">
                    Éditer
                  </Link>
                  <Link
                    href={articlePreviewPath(article.contentType, article.slug)}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-btn admin-btn-ghost text-xs"
                  >
                    Aperçu
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </QueueCard>

      <QueueCard
        title="Programmés"
        href="/admin/articles?status=SCHEDULED"
        empty="Aucune publication programmée."
      >
        {scheduled.length ? (
          <ul className="space-y-3">
            {scheduled.map((article) => (
              <li key={article.id} className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={articleEditPath(article.id)} className="font-medium hover:underline">
                    {article.title}
                  </Link>
                  <p className="text-xs text-[#9aa3b5]">
                    {articleTypeLabel(article.contentType)} · mise en ligne{" "}
                    {formatDate(article.scheduledAt, "d MMM yyyy HH:mm") || "—"}
                  </p>
                </div>
                <Link href={articleEditPath(article.id)} className="admin-btn admin-btn-ghost text-xs">
                  Éditer
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </QueueCard>

      <QueueCard
        title="Contacts nouveaux"
        href="/admin/contacts?status=NEW"
        empty="Aucun nouveau message."
      >
        {contacts.length ? (
          <ul className="space-y-3">
            {contacts.map((contact) => (
              <li key={contact.id}>
                <Link href="/admin/contacts?status=NEW" className="font-medium hover:underline">
                  {contact.subject}
                </Link>
                <p className="text-xs text-[#9aa3b5]">
                  {contact.name} · {formatDate(contact.createdAt, "d MMM yyyy HH:mm")}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </QueueCard>

      <section className="admin-card">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#9aa3b5]">
            Dernière émission
          </h2>
          <Link href="/admin/arena" className="text-xs text-[#9aa3b5] hover:text-white">
            Arena
          </Link>
        </div>
        {latestShow ? (
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Link href={`/admin/arena/${latestShow.id}`} className="font-medium hover:underline">
                {latestShow.title}
              </Link>
              <StatusBadge status={latestShow.status} />
            </div>
            <p className="text-sm text-[#9aa3b5]">
              {latestShow.guests[0]?.guest.name || "Sans invité"}
              {latestShow.airDate ? ` · ${formatDate(latestShow.airDate, "d MMM yyyy")}` : ""}
            </p>
            <Link
              href={`/admin/arena/${latestShow.id}`}
              className="admin-btn admin-btn-ghost mt-3 text-xs"
            >
              Éditer
            </Link>
          </div>
        ) : (
          <p className="text-sm text-[#9aa3b5]">Aucune émission pour l’instant.</p>
        )}
      </section>
    </div>
  );
}
