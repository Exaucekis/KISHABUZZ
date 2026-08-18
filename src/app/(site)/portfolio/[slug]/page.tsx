import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VideoEmbed } from "@/components/media/VideoEmbed";
import { getPortfolioBySlug } from "@/lib/data";
import { coverFocusStyle } from "@/lib/cover-focus";
import { imageAlt } from "@/lib/image-alt";
import { formatDate, portfolioTypeLabel } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPortfolioBySlug(slug);
  if (!item) return { title: "Portfolio" };
  return {
    title: item.title,
    description: item.description || `${portfolioTypeLabel(item.type)} — KISHA BUZZ`,
  };
}

export default async function PortfolioDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getPortfolioBySlug(slug);
  if (!item) notFound();

  const images = item.media.filter((m) => m.kind === "IMAGE");
  const videos = item.media.filter((m) => m.kind === "VIDEO");

  return (
    <article>
      <header className="border-b border-line bg-ink-2 pt-28 pb-12">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <p className="mb-3 text-xs uppercase tracking-[0.22em] text-ember-hot">
            {portfolioTypeLabel(item.type)}
          </p>
          <h1 className="font-display text-4xl leading-tight md:text-5xl lg:text-6xl">
            {item.title}
          </h1>
          <div className="mt-5 flex flex-wrap gap-3 text-sm text-paper-muted">
            {item.date ? <span>{formatDate(item.date)}</span> : null}
            {item.location ? <span>{item.location}</span> : null}
            {item.client ? <span>{item.client}</span> : null}
          </div>
        </div>
      </header>

      {item.coverImage ? (
        <div className="mx-auto max-w-5xl px-4 pt-10 md:px-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.coverImage}
            alt={imageAlt(item.coverAlt, item.title)}
            className="aspect-[21/9] w-full object-cover"
            style={coverFocusStyle(item.coverFocus)}
          />
        </div>
      ) : null}

      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        {item.description ? (
          <p className="font-serif text-xl leading-relaxed text-paper-muted whitespace-pre-line">
            {item.description}
          </p>
        ) : null}

        {item.link ? (
          <p className="mt-8">
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ember-hot hover:underline"
            >
              Voir le projet externe →
            </a>
          </p>
        ) : null}

        {videos.length ? (
          <div className="mt-12 space-y-6">
            <h2 className="font-display text-2xl">Vidéos</h2>
            {videos.map((v) => (
              <div key={v.id}>
                <VideoEmbed url={v.url} title={v.title} />
                <p className="mt-2 text-sm text-paper-muted">{v.title}</p>
              </div>
            ))}
          </div>
        ) : null}

        {images.length ? (
          <div className="mt-12">
            <h2 className="font-display text-2xl">Médias</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {images.map((img) => (
                <div key={img.id} className="overflow-hidden bg-ink-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.thumbnail || img.url}
                    alt={imageAlt(img.alt, img.title)}
                    className="aspect-[4/3] w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <p className="mt-12">
          <Link href="/portfolio" className="text-sm text-ember-hot">
            ← Retour au portfolio
          </Link>
        </p>
      </div>
    </article>
  );
}
