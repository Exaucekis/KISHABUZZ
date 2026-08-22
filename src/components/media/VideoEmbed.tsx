"use client";

import { useState } from "react";
import { IMAGE_EXT, isDirectVideo, parseMediaEmbed } from "@/lib/media";

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
      className="kb-embed kb-embed--16-9 kb-play-poster group relative w-full overflow-hidden bg-black text-left"
      onClick={onPlay}
      aria-label={`Lire ${title || "la vidéo"}`}
    >
      {/* Image de fond */}
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          className="kb-play-poster__bg absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black" />
      )}

      {/* Overlay gradient cinématique */}
      <span className="kb-play-poster__overlay absolute inset-0" aria-hidden />

      {/* Bouton play central */}
      <span className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <span className="kb-play-btn relative inline-flex h-20 w-20 items-center justify-center rounded-full">
          {/* Halo animé */}
          <span className="kb-play-btn__halo absolute inset-0 rounded-full" aria-hidden />
          {/* Icône */}
          <svg viewBox="0 0 24 24" className="relative z-10 ml-1 h-8 w-8 fill-white drop-shadow-lg" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>

        {/* Titre sous le bouton */}
        {title && (
          <span className="kb-play-poster__title px-6 text-center text-sm font-semibold uppercase tracking-widest text-white/80">
            {title}
          </span>
        )}
      </span>
    </button>
  );
}

function FileVideo({
  url,
  title,
  poster,
  autoPlay,
}: {
  url: string;
  title?: string;
  poster?: string;
  autoPlay?: boolean;
}) {
  return (
    <div className="kb-embed kb-embed--16-9">
      <video
        className="absolute inset-0 h-full w-full bg-black object-contain"
        controls
        playsInline
        autoPlay={autoPlay}
        preload={autoPlay ? "auto" : "metadata"}
        poster={poster || undefined}
        title={title || "Vidéo"}
      >
        <source src={url} />
        Votre navigateur ne prend pas en charge la lecture vidéo.
      </video>
    </div>
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
  const src = String(url || "").trim();
  const [playing, setPlaying] = useState(!lazy);
  const embed = parseMediaEmbed(src);
  const fileVideo = !embed && (isDirectVideo(src) || (!IMAGE_EXT.test(src) && Boolean(src)));

  if (!src) return null;

  if (fileVideo) {
    if (!playing) {
      return <PlayPoster title={title} poster={poster} onPlay={() => setPlaying(true)} />;
    }
    return <FileVideo url={src} title={title} poster={poster} autoPlay={lazy} />;
  }

  if (!embed) {
    return (
      <a
        href={src}
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
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
