import Link from "next/link";
import { deleteArticle, setArticleStatus } from "@/actions/admin/articles";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { articlePreviewPath } from "@/lib/article-paths";
import { articleTypeLabel } from "@/lib/editorial-dashboard";
import { formatViews } from "@/lib/page-views";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Articles & chroniques" };

type Props = { searchParams: Promise<{ type?: string; status?: string }> };

function articlesHref(type?: string, status?: string) {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (status) params.set("status", status);
  const query = params.toString();
  return query ? `/admin/articles?${query}` : "/admin/articles";
}

export default async function AdminArticlesPage({ searchParams }: Props) {
  const { type, status } = await searchParams;
  const articles = await prisma.article.findMany({
    where: {
      ...(type ? { contentType: type } : {}),
      ...(status ? { status } : {}),
    },
    include: { category: true },
    orderBy: [{ updatedAt: "desc" }],
  });

  return (
    <div>
      <AdminPageIntro
        title="Articles & chroniques"
        hint="Rédigez, programmez ou publiez. Un brouillon reste invisible du public : utilisez Aperçu pour le voir comme sur le site."
        actions={
          <Link href="/admin/articles/new" className="admin-btn admin-btn-primary">
            Nouveau
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <Link href={articlesHref(undefined, status)} className="admin-btn admin-btn-ghost">
          Tous
        </Link>
        <Link href={articlesHref("ARTICLE", status)} className="admin-btn admin-btn-ghost">
          Publications
        </Link>
        <Link href={articlesHref("CHRONIQUE", status)} className="admin-btn admin-btn-ghost">
          Chroniques
        </Link>
        <Link href={articlesHref("ANALYSIS", status)} className="admin-btn admin-btn-ghost">
          Analyses
        </Link>
        <span className="mx-1 self-center text-[#5c6474]">|</span>
        <Link href={articlesHref(type)} className="admin-btn admin-btn-ghost">
          Tous statuts
        </Link>
        <Link href={articlesHref(type, "DRAFT")} className="admin-btn admin-btn-ghost">
          Brouillons
        </Link>
        <Link href={articlesHref(type, "SCHEDULED")} className="admin-btn admin-btn-ghost">
          Programmés
        </Link>
        <Link href={articlesHref(type, "PUBLISHED")} className="admin-btn admin-btn-ghost">
          Publiés
        </Link>
      </div>

      <div className="admin-card overflow-x-auto p-0">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Type</th>
              <th>Statut</th>
              <th>Vues</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a.id}>
                <td>
                  <Link href={`/admin/articles/${a.id}`} className="font-medium hover:underline">
                    {a.title}
                  </Link>
                  {a.category ? (
                    <p className="text-xs text-[#9aa3b5]">{a.category.name}</p>
                  ) : null}
                </td>
                <td>{articleTypeLabel(a.contentType)}</td>
                <td>
                  <StatusBadge status={a.status} />
                </td>
                <td className="whitespace-nowrap text-[#aeb6c5]">{formatViews(a.views)}</td>
                <td className="whitespace-nowrap text-[#aeb6c5]">
                  {formatDate(
                    a.status === "SCHEDULED" ? a.scheduledAt || a.updatedAt : a.publishedAt || a.updatedAt,
                    "d MMM yyyy HH:mm"
                  )}
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    <Link href={`/admin/articles/${a.id}`} className="admin-btn admin-btn-ghost text-xs">
                      Éditer
                    </Link>
                    <Link
                      href={articlePreviewPath(a.contentType, a.slug)}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-btn admin-btn-ghost text-xs"
                    >
                      Aperçu
                    </Link>
                    {a.status !== "PUBLISHED" ? (
                      <form action={setArticleStatus}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="status" value="PUBLISHED" />
                        <button type="submit" className="admin-btn admin-btn-ghost text-xs">
                          Publier
                        </button>
                      </form>
                    ) : (
                      <form action={setArticleStatus}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="status" value="DRAFT" />
                        <button type="submit" className="admin-btn admin-btn-ghost text-xs">
                          Dépublier
                        </button>
                      </form>
                    )}
                    <form action={deleteArticle}>
                      <input type="hidden" name="id" value={a.id} />
                      <button type="submit" className="admin-btn admin-btn-danger text-xs">
                        Suppr.
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {!articles.length ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#9aa3b5]">
                  Aucun contenu.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
