import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShareButtons } from "@/components/content/ShareButtons";
import { PageViews } from "@/components/content/PageViews";
import { VideoEmbed } from "@/components/media/VideoEmbed";
import { getShowBySlug } from "@/lib/data";
import { formatDate } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const show = await getShowBySlug(slug);
  if (!show) return { title: "Émission" };
  return {
    title: `${show.title} · Arena Culture`,
    description: show.theme || show.description || `Émission ${show.number} — Arena Culture`,
  };
}

export default async function ArenaEmissionDetailPage({ params }: Props) {
  const { slug } = await params;
  const show = await getShowBySlug(slug);
  if (!show) notFound();

  const guests = show.guests.map((g) => g.guest);
  const images = show.media.filter((m) => m.kind === "IMAGE");
  const videos = show.media.filter((m) => m.kind === "VIDEO");

  return (
    <article>
      <header className="ac-intro" style={{ maxWidth: "48rem" }}>
        <p className="ac-kicker">
          Épisode {String(show.number).padStart(2, "0")}
          {show.season ? ` · Saison ${show.season.number} (${show.season.year})` : ""}
        </p>
        <h1 className="font-display text-4xl uppercase leading-[0.95] md:text-5xl lg:text-6xl">
          {show.title}
        </h1>
        {show.theme ? (
          <p className="mt-4 text-lg text-paper-muted md:text-xl">{show.theme}</p>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-3 text-sm text-paper-muted">
          {show.airDate ? (
            <span>
              {formatDate(show.airDate)}
              {show.airTime ? ` · ${show.airTime}` : ""}
            </span>
          ) : null}
          <PageViews kind="show" id={show.id} initial={show.views} />
        </div>
      </header>

      {show.poster ? (
        <div className="mx-auto max-w-4xl px-4 pt-10 md:px-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={show.poster} alt="" className="mx-auto max-h-[70vh] object-contain" />
        </div>
      ) : null}

      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        {show.description ? (
          <p className="font-serif text-lg leading-relaxed text-paper-muted whitespace-pre-line">
            {show.description}
          </p>
        ) : null}

        {guests.length ? (
          <div className="mt-12">
            <h2 className="font-display text-2xl">Invités</h2>
            <ul className="mt-6 space-y-4">
              {guests.map((g) => (
                <li key={g.id} className="flex gap-4 border border-line p-4">
                  {g.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={g.photo}
                      alt=""
                      className="h-20 w-20 object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center bg-ink-3 font-display text-xl text-paper/30">
                      {g.name.slice(0, 1)}
                    </div>
                  )}
                  <div>
                    <p className="font-display text-xl">{g.name}</p>
                    {g.profession ? (
                      <p className="mt-1 text-sm text-paper-muted">{g.profession}</p>
                    ) : null}
                    {g.bio ? (
                      <p className="mt-2 text-sm text-paper-muted line-clamp-3">{g.bio}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {show.videoUrl ? (
          <div className="mt-12">
            <h2 className="mb-4 font-display text-2xl">Vidéo</h2>
            <VideoEmbed url={show.videoUrl} title={show.title} />
          </div>
        ) : null}

        {videos.length ? (
          <div className="mt-12 space-y-6">
            <h2 className="font-display text-2xl">Autres vidéos</h2>
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
            <h2 className="font-display text-2xl">Photos</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {images.map((img) => (
                <div key={img.id} className="overflow-hidden bg-ink-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.thumbnail || img.url}
                    alt={img.title}
                    className="aspect-[4/3] w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-12 border-t border-line pt-8">
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-paper-muted">Partager</p>
          <ShareButtons title={show.title} path={`/arena-culture/emissions/${show.slug}`} />
        </div>

        <p className="mt-10">
          <Link href="/arena-culture/emissions" className="text-sm text-arena-accent">
            ← Toutes les émissions
          </Link>
        </p>
      </div>
    </article>
  );
}
