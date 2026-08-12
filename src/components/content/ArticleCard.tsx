import Link from "next/link";
import { formatDate } from "@/lib/utils";

type ArticleCardProps = {
  href: string;
  title: string;
  excerpt?: string;
  coverImage?: string;
  category?: string | null;
  date?: Date | string | null;
  author?: string;
};

export function ArticleCard({
  href,
  title,
  excerpt,
  coverImage,
  category,
  date,
  author,
}: ArticleCardProps) {
  return (
    <article className="group kb-card-motion min-w-0">
      <Link href={href} className="block focus-ring">
        <div className="kb-shine relative aspect-[16/10] overflow-hidden bg-ink-3">
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImage}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-full w-full items-end bg-gradient-to-br from-[#1f6b00]/40 via-ink-3 to-ink p-4">
              <span className="font-display text-3xl text-paper/30">KB</span>
            </div>
          )}
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-paper-muted">
            {category ? <span className="font-semibold text-ember-text">{category}</span> : null}
            {date ? <span>{formatDate(date)}</span> : null}
          </div>
          <h3 className="font-display text-xl leading-snug transition group-hover:text-ember-text md:text-2xl">
            {title}
          </h3>
          {excerpt ? (
            <p className="line-clamp-3 text-sm leading-relaxed text-paper-muted">{excerpt}</p>
          ) : null}
          {author ? <p className="text-xs text-paper-muted">Par {author}</p> : null}
        </div>
      </Link>
    </article>
  );
}
