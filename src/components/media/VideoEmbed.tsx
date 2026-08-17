"use client";

import { useState } from "react";
import { getVideoEmbed } from "@/lib/utils";

function isDirectVideo(url: string) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url) || url.startsWith("/arena/videos/");
}

export function VideoEmbed({
  url,
  title,
  poster,
  lazy = false,
}: {
  url: string;
  title?: string;
  poster?: string;
  lazy?: boolean;
}) {
  const [playing, setPlaying] = useState(!lazy);

  if (isDirectVideo(url)) {
    if (!playing) {
      return (
        <button
          type="button"
          className="group relative aspect-video w-full overflow-hidden bg-black text-left"
          onClick={() => setPlaying(true)}
          aria-label={`Lire ${title || "la vidéo"}`}
        >
          {poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-ink-3 to-black" />
          )}
          <span className="absolute inset-0 grid place-items-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-ember text-on-ember shadow-lg transition group-hover:scale-105">
              <svg viewBox="0 0 24 24" className="ml-0.5 h-7 w-7 fill-current" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
        </button>
      );
    }

    return (
      <div className="relative aspect-video overflow-hidden bg-black">
        <video
          className="absolute inset-0 h-full w-full"
          controls
          playsInline
          autoPlay={lazy}
          preload={lazy ? "auto" : "metadata"}
          poster={poster || undefined}
          title={title || "Vidéo"}
        >
          <source src={url} type="video/mp4" />
          Votre navigateur ne prend pas en charge la lecture vidéo.
        </video>
      </div>
    );
  }

  const embed = getVideoEmbed(url);
  if (!embed) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex rounded-md border border-line px-4 py-3 text-sm text-ember-text"
      >
        Voir la vidéo
      </a>
    );
  }

  const src =
    embed.type === "youtube"
      ? `https://www.youtube-nocookie.com/embed/${embed.id}?rel=0`
      : `https://player.vimeo.com/video/${embed.id}`;

  return (
    <div className="relative aspect-video overflow-hidden bg-black">
      <iframe
        src={src}
        title={title || "Vidéo"}
        className="absolute inset-0 h-full w-full"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
