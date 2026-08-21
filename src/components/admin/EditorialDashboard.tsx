import Link from "next/link";
import type { ReactNode } from "react";
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

type LiveEvent = {
  id: string;
  title: string;
  startsAt: Date;
  status: string;
  city: string;
  venueName: string;
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
  events,
}: {
  drafts: Draft[];
  scheduled: Scheduled[];
  contacts: Contact[];
  events: LiveEvent[];
}) {
  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
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

      <QueueCard
        title="Événements en vente"
        href="/admin/evenements?vue=en-cours"
        empty="Aucun événement en cours."
      >
        {events.length ? (
          <ul className="space-y-3">
            {events.map((event) => (
              <li key={event.id} className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/admin/evenements/${event.id}?onglet=en-cours`}
                    className="font-medium hover:underline"
                  >
                    {event.title}
                  </Link>
                  <p className="text-xs text-[#9aa3b5]">
                    {formatDate(event.startsAt, "d MMM yyyy HH:mm")}
                    {event.city || event.venueName ? ` · ${event.city || event.venueName}` : ""}
                  </p>
                </div>
                <Link
                  href={`/admin/evenements/${event.id}?onglet=en-cours`}
                  className="admin-btn admin-btn-ghost text-xs"
                >
                  Ouvrir
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </QueueCard>
    </div>
  );
}
