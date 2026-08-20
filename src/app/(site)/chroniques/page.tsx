import type { Metadata } from "next";
import { ArticleCard } from "@/components/content/ArticleCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { getPublishedArticles } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Chroniques",
  description: "Analyses, opinions et chroniques publiées par KISHA BUZZ.",
};

export default async function ChroniquesPage() {
  const articles = await getPublishedArticles({ contentType: "CHRONIQUE" });

  return (
    <>
      <section className="border-b border-line bg-ink-2 pt-28 pb-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeading
            eyebrow="Éditorial"
            title="Chroniques"
            description="Regards, analyses et prises de parole sur la culture, le média et la société."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        {articles.length ? (
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                href={`/chroniques/${article.slug}`}
                title={article.title}
                excerpt={article.excerpt}
                coverImage={article.coverImage}
                coverAlt={article.coverAlt}
                coverFocus={article.coverFocus}
                category={article.category?.name}
                date={article.publishedAt}
                author={article.authorName}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Aucune chronique publiée"
            description="Les chroniques apparaîtront ici dès leur publication depuis le back-office."
            action={<ButtonLink href="/contact">Proposer un sujet</ButtonLink>}
          />
        )}
      </section>
    </>
  );
}
