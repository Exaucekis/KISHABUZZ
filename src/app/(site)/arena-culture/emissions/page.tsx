import type { Metadata } from "next";
import { ArenaPageIntro } from "@/components/arena/ArenaPageIntro";
import { EmptyState } from "@/components/ui/EmptyState";
import { VideoEmbed } from "@/components/media/VideoEmbed";
import { getArenaStage } from "@/lib/data";
import { arenaSpotlightGuest } from "@/lib/arena-spotlight";
import { arenaShowVideo, videoPoster } from "@/lib/media";

export const metadata: Metadata = {
  title: "Émissions · Arena Culture",
  description: "La nouvelle émission Arena Culture : vidéo, invité et domaine.",
};

export const dynamic = "force-dynamic";

export default async function ArenaEmissionsPage() {
  const stage = await getArenaStage();
  const featured = stage.headline && arenaShowVideo(stage.headline) ? stage.headline : null;
  const guest = featured ? arenaSpotlightGuest(featured) : null;
  const video = featured ? arenaShowVideo(featured) : "";
  const domain = featured?.theme || guest?.profession || "";
  const poster = featured
    ? videoPoster(video, featured.videoThumbnail) || String(featured.videoThumbnail || "").trim()
    : "";

  return (
    <>
      <ArenaPageIntro
        title="Émissions"
        description="La vidéo de l’émission, le nom de l’invité et le domaine."
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
        ) : (
          <EmptyState
            title="Aucune émission en vidéo"
            description="Publiez une émission depuis l’onglet Émissions : invité, domaine, vidéo et miniature. Elle apparaît ici tout de suite."
          />
        )}
      </section>
    </>
  );
}
