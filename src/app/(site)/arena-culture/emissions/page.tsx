import type { Metadata } from "next";
import { ArenaPageIntro } from "@/components/arena/ArenaPageIntro";
import { EmptyState } from "@/components/ui/EmptyState";
import { VideoEmbed } from "@/components/media/VideoEmbed";
import { getArenaStage, getGallery } from "@/lib/data";
import { arenaSpotlightGuest } from "@/lib/arena-spotlight";
import { arenaShowVideo, videoPoster } from "@/lib/media";

export const metadata: Metadata = {
  title: "Émissions · Arena Culture",
  description: "La nouvelle émission Arena Culture : vidéo, invité, domaine et extraits.",
};

export const dynamic = "force-dynamic";

export default async function ArenaEmissionsPage() {
  const [stage, videos] = await Promise.all([
    getArenaStage(),
    getGallery({ kind: "VIDEO", category: "ARENA_CULTURE" }),
  ]);
  const featured = stage.headline && arenaShowVideo(stage.headline) ? stage.headline : null;
  const guest = featured ? arenaSpotlightGuest(featured) : null;
  const video = featured ? arenaShowVideo(featured) : "";
  const domain = featured?.theme || guest?.profession || "";
  const poster = featured
    ? videoPoster(video, featured.videoThumbnail) || String(featured.videoThumbnail || "").trim()
    : "";
  const headlineId = stage.headline?.id;
  const extras = videos.filter(
    (item) =>
      !item.title.startsWith("Archive ·") && (!headlineId || item.arenaShow?.id !== headlineId)
  );

  return (
    <>
      <ArenaPageIntro
        title="Émissions"
        description="La vidéo de l’émission, le nom de l’invité et le domaine. Les extraits suivent en dessous."
      />

      <section className="ac-page">
        {featured && video ? (
          <article className="ac-episode ac-episode--featured">
            <VideoEmbed url={video} title={guest?.name || featured.title} poster={poster || undefined} />
            <div className="ac-episode__body">
              <p className="ac-kicker">Nouvelle émission</p>
              <h2>{guest?.name || featured.title}</h2>
              {domain ? <p className="ac-episode__domain">{domain}</p> : null}
            </div>
          </article>
        ) : extras.length ? null : (
          <EmptyState
            title="Aucune émission en vidéo"
            description="Publiez une émission depuis l’onglet Émissions : invité, domaine, vidéo et miniature. Elle apparaît ici tout de suite."
          />
        )}

        {extras.length ? (
          <div className="mt-16">
            <p className="ac-kicker">Extraits</p>
            <h2 className="mb-8 font-display text-3xl">Autres vidéos</h2>
            <div className="ac-videos">
              {extras.map((item) => (
                <div key={item.id} className="min-w-0">
                  <VideoEmbed
                    url={item.url}
                    title={item.title}
                    poster={videoPoster(item.url, item.thumbnail)}
                    lazy
                  />
                  <p className="mt-4 font-display text-xl">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
}
