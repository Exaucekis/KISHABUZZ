"use client";

import { useMemo, useState } from "react";
import { Lightbox } from "@/components/media/Lightbox";

type Photo = {
  id: string;
  title: string;
  url: string;
  description?: string;
};

export function ArenaAlbumGallery({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState<number | null>(null);

  const lightboxItems = useMemo(
    () =>
      photos.map((p) => ({
        src: p.url,
        alt: p.title,
        title: p.title,
      })),
    [photos]
  );

  if (!photos.length) {
    return (
      <p className="text-center text-paper-muted">Aucune photo dans cet album pour le moment.</p>
    );
  }

  return (
    <>
      <div className="ac-album-grid">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            type="button"
            className="ac-album-shot focus-ring"
            onClick={() => setIndex(i)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt={photo.title} loading="lazy" />
            <span>{photo.title}</span>
          </button>
        ))}
      </div>
      <Lightbox
        items={lightboxItems}
        index={index}
        onClose={() => setIndex(null)}
        onChange={setIndex}
      />
    </>
  );
}
