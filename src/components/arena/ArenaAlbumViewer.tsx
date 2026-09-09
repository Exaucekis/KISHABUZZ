"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { VideoEmbed } from "@/components/media/VideoEmbed";
import { FeaturedImageActions } from "@/components/content/FeaturedImageActions";
import { isPlayableMedia } from "@/lib/media";
import { imageAlt } from "@/lib/image-alt";

type Photo = {
  id: string;
  title: string;
  url: string;
  description?: string;
  alt?: string;
  engagement?: { likes: number; liked: boolean };
};

type Props = {
  guestName: string;
  emissionLabel?: string;
  photos: Photo[];
  albumPath: string;
};

export function ArenaAlbumViewer({ guestName, emissionLabel, photos, albumPath }: Props) {
  const [index, setIndex] = useState(0);
  const total = photos.length;
  const current = photos[index];

  const go = useCallback(
    (dir: -1 | 1) => {
      if (!total) return;
      setIndex((i) => (i + dir + total) % total);
    },
    [total]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (!current) {
    return (
      <p className="py-16 text-center text-paper-muted">
        Aucune photo dans cet album pour le moment.
      </p>
    );
  }

  return (
    <div id={`photo-${current.id}`} className="ac-viewer scroll-mt-28">
      <div className="ac-viewer__stage">
        {isPlayableMedia(current.url) ? (
          <div className="ac-viewer__video">
            <VideoEmbed url={current.url} title={current.title} />
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={current.id}
            src={current.url}
            alt={imageAlt(current.alt, current.title)}
            className="ac-viewer__image"
            decoding="async"
          />
        )}

        {total > 1 ? (
          <>
            <button
              type="button"
              className="ac-viewer__nav ac-viewer__nav--prev"
              onClick={() => go(-1)}
              aria-label="Photo précédente"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              className="ac-viewer__nav ac-viewer__nav--next"
              onClick={() => go(1)}
              aria-label="Photo suivante"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        ) : null}

        <div className="ac-viewer__overlay">
          <div>
            <p className="ac-kicker">{emissionLabel || "Arena Grand Culture"}</p>
            <h2 className="ac-viewer__title">{guestName}</h2>
            <p className="ac-viewer__caption">{current.title}</p>
          </div>
          <p className="ac-viewer__count">
            {index + 1} / {total}
          </p>
        </div>
      </div>

      {!isPlayableMedia(current.url) && current.engagement ? (
        <FeaturedImageActions
          targetType="ARENA_PHOTO"
          targetId={current.id}
          initialLikes={current.engagement.likes}
          initialLiked={current.engagement.liked}
          title={`${guestName} · ${current.title}`}
          path={`${albumPath}#photo-${current.id}`}
        />
      ) : null}

      {total > 1 ? (
        <div className="ac-viewer__controls">
          <button type="button" className="ac-btn ac-btn--ghost" onClick={() => go(-1)}>
            ← Précédente
          </button>
          <button type="button" className="ac-btn ac-btn--primary" onClick={() => go(1)}>
            Suivante →
          </button>
        </div>
      ) : null}

      {total > 1 ? (
        <div className="ac-viewer__thumbs" role="list">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              role="listitem"
              className={`ac-viewer__thumb${i === index ? " is-active" : ""}`}
              onClick={() => setIndex(i)}
              aria-label={photo.title}
              aria-current={i === index}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
