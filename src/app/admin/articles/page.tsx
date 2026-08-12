import Link from "next/link";
import { deleteArticle, setArticleStatus } from "@/actions/admin/articles";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Articles & chroniques" };

type Props = { searchParams: Promise<{ type?: string }> };

export default async function AdminArticlesPage({ searchParams }: Props) {
  const { type } = await searchParams;
  const articles = await prisma.article.findMany({
    where: type ? { contentType: type } : undefined,
    include: { category: true },
    orderBy: [{ updatedAt: "desc" }],
  });

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold">
            Articles & chroniques
          </h1>
          <p className="mt-1 text-sm text-[#9aa3b5]">{articles.length} élément(s)</p>
        </div>
        <Link href="/admin/articles/new" className="admin-btn admin-btn-primary">
          Nouveau
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <Link href="/admin/articles" className="admin-btn admin-btn-ghost">
          Tous
        </Link>
        <Link href="/admin/articles?type=ARTICLE" className="admin-btn admin-btn-ghost">
          Publications
        </Link>
        <Link href="/admin/articles?type=CHRONIQUE" className="admin-btn admin-btn-ghost">
          Chroniques
        </Link>
      </div>

      <div className="admin-card overflow-x-auto p-0">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Type</th>
              <th>Statut</th>
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
                <td>{a.contentType}</td>
                <td>
                  <StatusBadge status={a.status} />
                </td>
                <td className="whitespace-nowrap text-[#aeb6c5]">
                  {formatDate(a.publishedAt || a.updatedAt, "d MMM yyyy")}
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    <Link href={`/admin/articles/${a.id}`} className="admin-btn admin-btn-ghost text-xs">
                      Éditer
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
                <td colSpan={5} className="py-8 text-center text-[#9aa3b5]">
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
