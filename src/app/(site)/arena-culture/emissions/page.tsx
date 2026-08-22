import type { Metadata } from "next";
import { ArenaPageIntro } from "@/components/arena/ArenaPageIntro";
import { EmptyState } from "@/components/ui/EmptyState";
import { VideoEmbed } from "@/components/media/VideoEmbed";
import { getPublishedArenaShows } from "@/lib/data";
import { arenaSpotlightGuest } from "@/lib/arena-spotlight";
import { arenaShowVideo, videoPoster } from "@/lib/media";

export const metadata: Metadata = {
  title: "Émissions · Arena Culture",
  description: "Vidéo, miniature, nom de l’invité et thème de l’émission.",
};

export const dynamic = "force-dynamic";

export default async function ArenaEmissionsPage() {
  const shows = await getPublishedArenaShows();

  return (
    <>
      <ArenaPageIntro
        title="Émissions"
        description="La vidéo, sa miniature, le nom de l’invité et le thème. Rien d’autre."
      />

      <section className="ac-page">
        {shows.length ? (
          <div className="space-y-16">
            {shows.map((show, index) => {
              const guest = arenaSpotlightGuest(show);
              const video = arenaShowVideo(show);
              const theme = show.theme || guest?.profession || "";
              const thumbnail = videoPoster(video, show.videoThumbnail);
              if (!video) return null;
              return (
                <article
                  key={show.id}
                  className={index === 0 ? "ac-episode ac-episode--featured" : "ac-episode"}
                >
                  <VideoEmbed
                    url={video}
                    title={guest?.name || show.title}
                    poster={thumbnail || undefined}
                  />
                  <div className="ac-episode__body">
                    {index === 0 ? <p className="ac-kicker">Nouvelle émission</p> : null}
                    <h2>{guest?.name || show.title}</h2>
                    {theme ? <p className="ac-episode__domain">{theme}</p> : null}
                  </div>
                </article>
              );
            })}
          </div>
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
