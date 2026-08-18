import Link from "next/link";
import { ArticleCard } from "@/components/content/ArticleCard";
import { ArticleBody } from "@/components/content/ArticleBody";
import { PreviewBanner } from "@/components/content/PreviewBanner";
import { PageViews } from "@/components/content/PageViews";
import { ShareButtons } from "@/components/content/ShareButtons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { articleEditPath, articlePublicPath } from "@/lib/article-paths";
import { coverFocusStyle } from "@/lib/cover-focus";
import { imageAlt } from "@/lib/image-alt";
import { formatDate } from "@/lib/utils";

type ArticleView = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  coverAlt?: string;
  coverFocus?: string;
  contentType: string;
  status: string;
  views?: number;
  publishedAt: Date | null;
  authorName: string;
  category: { name: string } | null;
  tags: { tag: { id: string; name: string } }[];
};

type RelatedArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  coverAlt?: string;
  coverFocus?: string;
  contentType: string;
  publishedAt: Date | null;
  category: { name: string } | null;
};

export function ArticleDetail({
  article,
  related,
  isStaffPreview = false,
}: {
  article: ArticleView;
  related: RelatedArticle[];
  isStaffPreview?: boolean;
}) {
  const isChronique = article.contentType === "CHRONIQUE";
  const path = articlePublicPath(article.contentType, article.slug);
  const tags = article.tags.map((row) => row.tag);

  return (
    <article>
      <header className="border-b border-line bg-ink-2 pt-28 pb-12">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          {isStaffPreview ? (
            <PreviewBanner status={article.status} editHref={articleEditPath(article.id)} />
          ) : null}
          <p className="mb-3 text-xs uppercase tracking-[0.22em] text-ember-hot">
            {isChronique ? "Chronique" : article.category?.name || "Publication"}
          </p>
          <h1 className="font-display text-4xl leading-tight md:text-5xl lg:text-6xl">
            {article.title}
          </h1>
          <div className="mt-5 flex flex-wrap gap-3 text-sm text-paper-muted">
            {article.publishedAt ? <span>{formatDate(article.publishedAt)}</span> : null}
            {article.authorName ? <span>Par {article.authorName}</span> : null}
            {isChronique && article.category ? <span>{article.category.name}</span> : null}
            <PageViews
              kind="article"
              id={article.id}
              initial={article.views ?? 0}
              record={!isStaffPreview && article.status === "PUBLISHED"}
            />
          </div>
        </div>
      </header>

      {article.coverImage ? (
        <div className="mx-auto max-w-5xl px-4 pt-10 md:px-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.coverImage}
            alt={imageAlt(article.coverAlt, article.title)}
            className="aspect-[21/9] w-full object-cover"
            style={coverFocusStyle(article.coverFocus)}
          />
        </div>
      ) : null}

      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        {article.excerpt ? (
          <p className="mb-8 font-serif text-xl leading-relaxed text-paper-muted">
            {article.excerpt}
          </p>
        ) : null}
        <ArticleBody
          className={
            isChronique
              ? "prose-editorial space-y-4 text-base leading-relaxed text-paper md:text-lg [&_a]:text-ember-hot [&_h2]:font-display [&_h2]:text-3xl [&_h3]:font-display [&_h3]:text-2xl [&_p]:text-paper-muted"
              : "space-y-4 text-base leading-relaxed md:text-lg [&_a]:text-ember-hot [&_h2]:font-display [&_h2]:text-3xl [&_h3]:font-display [&_h3]:text-2xl [&_p]:text-paper-muted"
          }
          html={article.content}
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

        {!isStaffPreview ? (
          <div className="mt-12 border-t border-line pt-8">
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-paper-muted">Partager</p>
            <ShareButtons title={article.title} path={path} />
          </div>
        ) : null}
      </div>

      {related.length ? (
        <section className="border-t border-line bg-ink-2 py-16">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <SectionHeading title={isChronique ? "À lire aussi" : "Articles associés"} />
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {related.map((item) => (
                <ArticleCard
                  key={item.id}
                  href={articlePublicPath(item.contentType, item.slug)}
                  title={item.title}
                  excerpt={item.excerpt}
                  coverImage={item.coverImage}
                  coverAlt={item.coverAlt}
                  coverFocus={item.coverFocus}
                  category={item.category?.name}
                  date={item.publishedAt}
                />
              ))}
            </div>
            <p className="mt-8">
              <Link href={isChronique ? "/chroniques" : "/publications"} className="text-sm text-ember-hot">
                {isChronique ? "← Toutes les chroniques" : "← Toutes les publications"}
              </Link>
            </p>
          </div>
        </section>
      ) : null}
    </article>
  );
}
