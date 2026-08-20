import type { Metadata } from "next";
import Link from "next/link";
import { ArenaPageIntro } from "@/components/arena/ArenaPageIntro";
import { EmptyState } from "@/components/ui/EmptyState";
import { VideoEmbed } from "@/components/media/VideoEmbed";
import { getArchivedShows, getArenaStage, getPublishedShows } from "@/lib/data";
import { arenaSpotlightGuest } from "@/lib/arena-spotlight";
import { videoPoster } from "@/lib/media";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Émissions · Arena Culture",
  description: "Toutes les émissions Arena Culture publiées.",
};

export const dynamic = "force-dynamic";

type ShowItem = {
  id: string;
  slug: string;
  title: string;
  theme: string;
  poster: string;
  videoUrl: string;
  videoThumbnail: string;
  number: number;
  airDate: Date | null;
  season: { number: number } | null;
  guests: {
    guest: {
      name: string;
      profession?: string | null;
      photo?: string | null;
      visible?: boolean | null;
    };
  }[];
};

function episodeVideo(show: ShowItem) {
  return String(show.videoUrl || "").trim();
}

function ShowEpisode({
  show,
  kicker,
  featured = false,
}: {
  show: ShowItem;
  kicker?: string;
  featured?: boolean;
}) {
  const guest = arenaSpotlightGuest(show);
  const video = episodeVideo(show);
  const poster = videoPoster(video, show.videoThumbnail) || String(show.videoThumbnail || "").trim();
  const domain = show.theme || guest?.profession || "";

  return (
    <article className={featured ? "ac-episode ac-episode--featured" : "ac-episode"}>
      {video ? (
        <VideoEmbed url={video} title={guest?.name || show.title} poster={poster || undefined} />
      ) : null}
      <div className="ac-episode__body">
        <p className="ac-kicker">{kicker || (domain ? domain : "Émission")}</p>
        <h2>
          <Link href={`/arena-culture/emissions/${show.slug}`}>{guest?.name || show.title}</Link>
        </h2>
        {domain && guest?.name ? <p className="ac-episode__domain">{domain}</p> : null}
        {show.airDate ? <p className="ac-episode__date">{formatDate(show.airDate)}</p> : null}
      </div>
    </article>
  );
}

export default async function ArenaEmissionsPage() {
  const [shows, stage, archived] = await Promise.all([
    getPublishedShows(),
    getArenaStage(),
    getArchivedShows({ take: 12 }),
  ]);

  const withVideo = [stage.headline, ...shows].filter(
    (show): show is NonNullable<typeof show> => Boolean(show && episodeVideo(show))
  );
  const seen = new Set<string>();
  const uniqueVideos = withVideo.filter((show) => {
    if (seen.has(show.id)) return false;
    seen.add(show.id);
    return true;
  });
  const featured = uniqueVideos[0] || null;
  const rest = uniqueVideos.slice(1);
  const replays = archived.filter((show) => show.id !== featured?.id && episodeVideo(show));

  return (
    <>
      <ArenaPageIntro
        title="Émissions"
        description="La nouvelle émission en vidéo, le nom de l’invité et le domaine."
      />

      <section className="ac-page space-y-16">
        {featured ? (
          <ShowEpisode show={featured} kicker="Nouvelle émission" featured />
        ) : null}

        {rest.length ? (
          <div>
            <p className="ac-kicker mb-4">À (re)découvrir</p>
            <div className="ac-episode-grid">
              {rest.map((show) => (
                <ShowEpisode key={show.id} show={show} />
              ))}
            </div>
          </div>
        ) : null}

        {replays.length ? (
          <div>
            <div className="mb-6 flex items-end justify-between gap-3">
              <h2 className="font-display text-2xl md:text-3xl">Rediffusions</h2>
              <Link href="/arena-culture/archives" className="text-sm text-[var(--ac-amber)] hover:underline">
                Toutes les archives
              </Link>
            </div>
            <div className="ac-episode-grid">
              {replays.map((show) => (
                <ShowEpisode key={show.id} show={show} />
              ))}
            </div>
          </div>
        ) : null}

        {!featured && !rest.length && !replays.length ? (
          <EmptyState
            title="Aucune émission publiée"
            description="Publiez une émission depuis l’onglet Émissions : la vidéo apparaît ici tout de suite."
          />
        ) : null}
      </section>
    </>
  );
}
