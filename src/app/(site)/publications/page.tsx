import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/content/ArticleCard";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getCategories, getPublishedArticles } from "@/lib/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Publications",
  description: "Articles, analyses et contenus éditoriaux de KISHA BUZZ.",
};

type Props = {
  searchParams: Promise<{ categorie?: string; type?: string }>;
};

export default async function PublicationsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const categorySlug = sp.categorie || undefined;
  const contentType = sp.type || undefined;

  const [articles, categories] = await Promise.all([
    getPublishedArticles({
      categorySlug,
      contentType: contentType || undefined,
    }),
    getCategories("publication"),
  ]);

  return (
    <>
      <section className="border-b border-line bg-ink-2 pt-28 pb-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeading
            eyebrow="Média"
            title="Publications"
            description="Articles, analyses et contenus culturels publiés par KISHA BUZZ."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        {categories.length ? (
          <div className="flex flex-wrap gap-2">
            <Link
              href="/publications"
              className={cn(
                "rounded-md border px-3 py-2 text-sm",
                !categorySlug
                  ? "border-ember bg-ember text-on-ember"
                  : "border-line text-paper-muted hover:text-paper"
              )}
            >
              Toutes
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/publications?categorie=${cat.slug}`}
                className={cn(
                  "rounded-md border px-3 py-2 text-sm",
                  categorySlug === cat.slug
                    ? "border-ember bg-ember text-on-ember"
                    : "border-line text-paper-muted hover:text-paper"
                )}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6 md:pb-20">
        {articles.length ? (
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                href={
                  article.contentType === "CHRONIQUE"
                    ? `/chroniques/${article.slug}`
                    : `/publications/${article.slug}`
                }
                title={article.title}
                excerpt={article.excerpt}
                coverImage={article.coverImage}
                category={article.category?.name}
                date={article.publishedAt}
                author={article.authorName}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Aucune publication"
            description="Les articles seront listés ici dès leur mise en ligne."
            action={<ButtonLink href="/contact">Proposer un contenu</ButtonLink>}
          />
        )}
      </section>
    </>
  );
}
