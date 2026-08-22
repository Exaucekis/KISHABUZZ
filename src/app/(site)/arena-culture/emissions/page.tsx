import type { Metadata } from "next";
import { ArenaPageIntro } from "@/components/arena/ArenaPageIntro";
import { EmptyState } from "@/components/ui/EmptyState";
import { VideoEmbed } from "@/components/media/VideoEmbed";
import { getArenaStage } from "@/lib/data";
import { arenaSpotlightGuest } from "@/lib/arena-spotlight";
import { arenaShowVideo } from "@/lib/media";

export const metadata: Metadata = {
  title: "Émissions · Arena Culture",
  description: "La nouvelle émission Arena Culture : vidéo, miniature, invité et thème.",
};

export const dynamic = "force-dynamic";

export default async function ArenaEmissionsPage() {
  const stage = await getArenaStage();
  const featured = stage.headline && arenaShowVideo(stage.headline) ? stage.headline : null;
  const guest = featured ? arenaSpotlightGuest(featured) : null;
  const video = featured ? arenaShowVideo(featured) : "";
  const domain = featured?.theme || guest?.profession || "";
  const thumbnail = String(featured?.videoThumbnail || "").trim();

  return (
    <>
      <ArenaPageIntro
        title="Émissions"
        description="La vidéo, sa miniature, le nom de l’invité et le thème. Pas d’affiche."
      />

      <section className="ac-page">
        {featured && video ? (
          <article className="ac-episode ac-episode--featured">
            <VideoEmbed
              url={video}
              title={guest?.name || featured.title}
              poster={thumbnail || undefined}
            />
            <div className="ac-episode__body">
              <p className="ac-kicker">Nouvelle émission</p>
              <h2>{guest?.name || featured.title}</h2>
              {domain ? <p className="ac-episode__domain">{domain}</p> : null}
            </div>
          </article>
        ) : (
          <EmptyState
            title="Aucune émission en vidéo"
            description="Publiez une émission depuis l’onglet Émissions : invité, thème, vidéo et miniature. Elle apparaît ici tout de suite."
          />
        )}
      </section>
    </>
  );
}
