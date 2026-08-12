"use client";

import { getVideoEmbed } from "@/lib/utils";

function isDirectVideo(url: string) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url) || url.startsWith("/arena/videos/");
}

export function VideoEmbed({ url, title }: { url: string; title?: string }) {
  if (isDirectVideo(url)) {
    return (
      <div className="relative aspect-video overflow-hidden bg-black">
        <video
          className="absolute inset-0 h-full w-full"
          controls
          playsInline
          preload="metadata"
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
