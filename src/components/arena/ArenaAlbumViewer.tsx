"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Photo = {
  id: string;
  title: string;
  url: string;
  description?: string;
};

type Props = {
  guestName: string;
  emissionLabel?: string;
  photos: Photo[];
};

export function ArenaAlbumViewer({ guestName, emissionLabel, photos }: Props) {
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
    <div className="ac-viewer">
      <div className="ac-viewer__stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={current.id}
          src={current.url}
          alt={current.title}
          className="ac-viewer__image"
          decoding="async"
        />

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
