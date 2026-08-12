import type { Metadata } from "next";
import Link from "next/link";
import { ArenaPageIntro } from "@/components/arena/ArenaPageIntro";
import { EmptyState } from "@/components/ui/EmptyState";
import { VideoEmbed } from "@/components/media/VideoEmbed";
import { getGallery, getPublishedShows } from "@/lib/data";

export const metadata: Metadata = {
  title: "Vidéos · Arena Culture",
  description: "Vidéos et extraits des émissions Arena Culture.",
};

export default async function ArenaVideosPage() {
  const [shows, videos] = await Promise.all([
    getPublishedShows(),
    getGallery({ kind: "VIDEO", category: "ARENA_CULTURE" }),
  ]);

  const showVideos = shows.filter((s) => s.videoUrl);
  const [featured, ...restVideos] = videos;

  return (
    <>
      <ArenaPageIntro title="Vidéos" description="Émissions complètes et extraits." />

      <section className="ac-page space-y-14">
        {featured ? (
          <div>
            <h2 className="mb-6 font-display text-2xl md:text-3xl">{featured.title}</h2>
            <div className="ac-video-featured">
              <VideoEmbed url={featured.url} title={featured.title} />
              {featured.description ? (
                <p className="mt-4 max-w-2xl text-paper-muted">{featured.description}</p>
              ) : null}
            </div>
          </div>
        ) : null}

        {showVideos.length ? (
          <div>
            <h2 className="mb-6 font-display text-2xl md:text-3xl">Émissions</h2>
            <div className="ac-videos">
              {showVideos.map((s) => (
                <div key={s.id} className="min-w-0">
                  <VideoEmbed url={s.videoUrl} title={s.title} />
                  <Link
                    href={`/arena-culture/emissions/${s.slug}`}
                    className="mt-4 block font-display text-xl hover:text-[var(--ac-amber)]"
                  >
                    {s.title}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {restVideos.length ? (
          <div>
            <h2 className="mb-6 font-display text-2xl md:text-3xl">Autres vidéos</h2>
            <div className="ac-videos">
              {restVideos.map((v) => (
                <div key={v.id} className="min-w-0">
                  <VideoEmbed url={v.url} title={v.title} />
                  <p className="mt-4 font-display text-xl">{v.title}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {!featured && !showVideos.length && !restVideos.length ? (
          <EmptyState
            title="Aucune vidéo publiée"
            description="Les vidéos Arena Culture seront disponibles ici dès leur mise en ligne."
          />
        ) : null}
      </section>
    </>
  );
}
