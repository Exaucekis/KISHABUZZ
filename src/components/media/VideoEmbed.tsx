"use client";

import { useState } from "react";
import { isDirectVideo, parseMediaEmbed } from "@/lib/media";

function PlayPoster({
  title,
  poster,
  onPlay,
}: {
  title?: string;
  poster?: string;
  onPlay: () => void;
}) {
  return (
    <button
      type="button"
      className="kb-embed kb-embed--16-9 group relative w-full overflow-hidden bg-black text-left"
      onClick={onPlay}
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
      return <PlayPoster title={title} poster={poster} onPlay={() => setPlaying(true)} />;
    }

    return (
      <div className="kb-embed kb-embed--16-9">
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

  const embed = parseMediaEmbed(url);
  if (!embed) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex rounded-md border border-line px-4 py-3 text-sm text-ember-text"
      >
        Voir le média
      </a>
    );
  }

  if (!playing) {
    return <PlayPoster title={title} poster={poster} onPlay={() => setPlaying(true)} />;
  }

  const ratioClass =
    embed.ratio === "9/16"
      ? "kb-embed--9-16"
      : embed.ratio === "4/5"
        ? "kb-embed--4-5"
        : "kb-embed--16-9";

  return (
    <div className={`kb-embed kb-embed--${embed.provider} ${ratioClass}`}>
      <iframe
        src={embed.src}
        title={title || `Vidéo ${embed.provider}`}
        className="absolute inset-0 h-full w-full"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
