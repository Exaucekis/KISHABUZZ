"use client";

import { ListVideo, Play } from "lucide-react";
import { useState } from "react";
import { ShareButtons } from "@/components/content/ShareButtons";
import { VideoEmbed } from "@/components/media/VideoEmbed";

export type ArenaChannelVideo = {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
};

export function ArenaVideoChannel({
  videos,
  showPath,
  initialVideoId,
}: {
  videos: ArenaChannelVideo[];
  showPath: string;
  initialVideoId?: string;
}) {
  const [activeId, setActiveId] = useState(() =>
    videos.some((video) => video.id === initialVideoId) ? initialVideoId! : videos[0]?.id
  );
  const activeVideo = videos.find((video) => video.id === activeId) || videos[0];
  if (!activeVideo) return null;

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]" aria-label="Lecteur et playlist de l’émission">
      <div>
        <VideoEmbed
          key={activeVideo.id}
          url={activeVideo.url}
          title={activeVideo.title}
          poster={activeVideo.thumbnail}
        />
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-line bg-ink-2 p-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-arena-accent">Lecture en cours</p>
            <h2 className="mt-1 font-display text-xl">{activeVideo.title}</h2>
            {activeVideo.description ? <p className="mt-1 text-sm text-paper-muted">{activeVideo.description}</p> : null}
          </div>
          <ShareButtons title={activeVideo.title} path={`${showPath}?video=${encodeURIComponent(activeVideo.id)}`} compact compactLabel="Partager" />
        </div>
      </div>

      <aside className="rounded-xl border border-line bg-ink-2 p-3" aria-label="Playlist">
        <div className="mb-3 flex items-center gap-2 px-1 text-sm font-semibold">
          <ListVideo className="h-4 w-4 text-arena-accent" />
          Playlist · {videos.length} vidéo{videos.length > 1 ? "s" : ""}
        </div>
        <ol className="space-y-2">
          {videos.map((video, index) => {
            const active = video.id === activeVideo.id;
            return (
              <li key={video.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(video.id)}
                  aria-current={active ? "true" : undefined}
                  className={`flex w-full items-center gap-3 rounded-lg p-2 text-left transition ${active ? "bg-arena-accent/15 ring-1 ring-arena-accent/45" : "hover:bg-ink-3"}`}
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/20 text-xs font-bold text-paper-muted">
                    {active ? <Play className="h-3.5 w-3.5 fill-current text-arena-accent" /> : index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{video.title}</span>
                    <span className="block truncate text-xs text-paper-muted">{active ? "Lecture en cours" : "Lire cette vidéo"}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </aside>
    </section>
  );
}
