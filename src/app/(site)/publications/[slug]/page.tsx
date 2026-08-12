import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/content/ArticleCard";
import { ShareButtons } from "@/components/content/ShareButtons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getArticleBySlug, getRelatedArticles } from "@/lib/data";
import { formatDate } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Publication" };
  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt,
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt,
      images: article.coverImage ? [article.coverImage] : undefined,
    },
  };
}

export default async function PublicationDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const related = await getRelatedArticles(article);
  const tags = article.tags.map((t) => t.tag);

  return (
    <article>
      <header className="border-b border-line bg-ink-2 pt-28 pb-12">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <p className="mb-3 text-xs uppercase tracking-[0.22em] text-ember-hot">
            {article.category?.name || "Publication"}
          </p>
          <h1 className="font-display text-4xl leading-tight md:text-5xl lg:text-6xl">
            {article.title}
          </h1>
          <div className="mt-5 flex flex-wrap gap-3 text-sm text-paper-muted">
            {article.publishedAt ? <span>{formatDate(article.publishedAt)}</span> : null}
            {article.authorName ? <span>Par {article.authorName}</span> : null}
          </div>
        </div>
      </header>

      {article.coverImage ? (
        <div className="mx-auto max-w-5xl px-4 pt-10 md:px-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.coverImage}
            alt=""
            className="aspect-[21/9] w-full object-cover"
          />
        </div>
      ) : null}

      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        {article.excerpt ? (
          <p className="mb-8 font-serif text-xl leading-relaxed text-paper-muted">
            {article.excerpt}
          </p>
        ) : null}
        <div
          className="space-y-4 text-base leading-relaxed md:text-lg [&_a]:text-ember-hot [&_h2]:font-display [&_h2]:text-3xl [&_h3]:font-display [&_h3]:text-2xl [&_p]:text-paper-muted"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {tags.length ? (
          <div className="mt-10 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="border border-line px-3 py-1 text-xs uppercase tracking-[0.16em] text-paper-muted"
              >
                {tag.name}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-12 border-t border-line pt-8">
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-paper-muted">Partager</p>
          <ShareButtons title={article.title} path={`/publications/${article.slug}`} />
        </div>
      </div>

      {related.length ? (
        <section className="border-t border-line bg-ink-2 py-16">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <SectionHeading title="Articles associés" />
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {related.map((item) => (
                <ArticleCard
                  key={item.id}
                  href={
                    item.contentType === "CHRONIQUE"
                      ? `/chroniques/${item.slug}`
                      : `/publications/${item.slug}`
                  }
                  title={item.title}
                  excerpt={item.excerpt}
                  coverImage={item.coverImage}
                  category={item.category?.name}
                  date={item.publishedAt}
                />
              ))}
            </div>
            <p className="mt-8">
              <Link href="/publications" className="text-sm text-ember-hot">
                ← Toutes les publications
              </Link>
            </p>
          </div>
        </section>
      ) : null}
    </article>
  );
}
