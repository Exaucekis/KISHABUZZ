import type { Metadata } from "next";
import { ArenaPageIntro } from "@/components/arena/ArenaPageIntro";
import { EmptyState } from "@/components/ui/EmptyState";
import { VideoEmbed } from "@/components/media/VideoEmbed";
import { getArenaStage, getGallery } from "@/lib/data";
import { videoPoster } from "@/lib/media";

export const metadata: Metadata = {
  title: "Vidéos · Arena Culture",
  description: "Extraits et autres vidéos Arena Culture.",
};

export default async function ArenaVideosPage() {
  const [videos, stage] = await Promise.all([
    getGallery({ kind: "VIDEO", category: "ARENA_CULTURE" }),
    getArenaStage(),
  ]);

  const headlineId = stage.headline?.id;
  const extras = videos.filter(
    (video) =>
      !video.title.startsWith("Archive ·") && (!headlineId || video.arenaShow?.id !== headlineId)
  );

  return (
    <>
      <ArenaPageIntro
        title="Vidéos"
        description="Extraits et autres vidéos. L’émission en cours se joue dans Émissions."
      />

      <section className="ac-page">
        {extras.length ? (
          <div className="ac-videos">
            {extras.map((v) => (
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
        ) : (
          <EmptyState
            title="Aucun extrait publié"
            description="Les extraits Arena Culture apparaîtront ici. L’émission en cours se trouve dans Émissions."
          />
        )}
      </section>
    </>
  );
}
