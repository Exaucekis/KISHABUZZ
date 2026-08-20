import type { Metadata } from "next";
import Link from "next/link";
import { ArenaPageIntro } from "@/components/arena/ArenaPageIntro";
import { EmptyState } from "@/components/ui/EmptyState";
import { VideoEmbed } from "@/components/media/VideoEmbed";
import { getArenaStage, getGallery, getPublishedShows } from "@/lib/data";
import { videoPoster } from "@/lib/media";

export const metadata: Metadata = {
  title: "Vidéos · Arena Culture",
  description: "Vidéos et extraits des émissions Arena Culture.",
};

export default async function ArenaVideosPage() {
  const [shows, videos, stage] = await Promise.all([
    getPublishedShows(),
    getGallery({ kind: "VIDEO", category: "ARENA_CULTURE" }),
    getArenaStage(),
  ]);

  const headline = stage.headline;
  const showVideos = shows.filter((s) => s.videoUrl && s.id !== headline?.id);
  const spotlightVideo = String(headline?.videoUrl || "").trim();
  const featured =
    headline && spotlightVideo
      ? {
          title: headline.title,
          url: spotlightVideo,
          thumbnail: headline.videoThumbnail || headline.poster,
          description: headline.theme || headline.description,
          slug: headline.slug,
        }
      : null;
  const restVideos = videos.filter((video) => !headline || video.arenaShow?.id !== headline.id);

  return (
    <>
      <ArenaPageIntro title="Vidéos" description="Émissions complètes et extraits." />

      <section className="ac-page space-y-14">
        {featured ? (
          <div>
            <h2 className="mb-6 font-display text-2xl md:text-3xl">{featured.title}</h2>
            <div className="ac-video-featured">
              <VideoEmbed
                url={featured.url}
                title={featured.title}
                poster={videoPoster(featured.url, featured.thumbnail)}
              />
              {featured.description ? (
                <p className="mt-4 max-w-2xl text-paper-muted">{featured.description}</p>
              ) : null}
              {featured.slug ? (
                <p className="mt-3">
                  <Link
                    href={`/arena-culture/emissions/${featured.slug}`}
                    className="text-[var(--ac-amber)] hover:underline"
                  >
                    Voir l’émission
                  </Link>
                </p>
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
                  <VideoEmbed
                    url={s.videoUrl}
                    title={s.title}
                    poster={videoPoster(s.videoUrl, s.videoThumbnail || s.poster)}
                    lazy
                  />
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
                  <VideoEmbed
                    url={v.url}
                    title={v.title}
                    poster={videoPoster(v.url, v.thumbnail)}
                    lazy
                  />
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
