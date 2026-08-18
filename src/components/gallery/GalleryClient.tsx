"use client";

import { useMemo, useState } from "react";
import { Lightbox } from "@/components/media/Lightbox";
import { VideoEmbed } from "@/components/media/VideoEmbed";
import { EmptyState } from "@/components/ui/EmptyState";
import { isPlayableMedia } from "@/lib/media";
import { imageAlt } from "@/lib/image-alt";
import { galleryCategoryLabel } from "@/lib/utils";

type Item = {
  id: string;
  title: string;
  description?: string;
  kind: string;
  url: string;
  thumbnail?: string;
  category?: string;
  alt?: string;
};

const TABS = [
  { id: "TOUT", label: "Tout" },
  { id: "PHOTOS", label: "Photos" },
  { id: "VIDEOS", label: "Vidéos" },
] as const;

export function GalleryClient({ items }: { items: Item[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("TOUT");
  const [index, setIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (tab === "PHOTOS") return items.filter((i) => i.kind === "IMAGE" && !isPlayableMedia(i.url));
    if (tab === "VIDEOS") return items.filter((i) => i.kind === "VIDEO" || isPlayableMedia(i.url));
    return items;
  }, [items, tab]);

  const lightboxItems = useMemo(
    () =>
      filtered
        .filter((i) => i.kind === "IMAGE")
        .map((i) => ({
          src: i.url,
          alt: imageAlt(i.alt, i.title),
          title: i.title,
        })),
    [filtered]
  );

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Filtrer la galerie">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={
              tab === t.id
                ? "rounded-md bg-ember px-4 py-2 text-sm font-semibold text-on-ember"
                : "rounded-md border border-line px-4 py-2 text-sm text-paper-muted hover:text-paper"
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {!filtered.length ? (
        <EmptyState
          title="Aucun média pour ce filtre"
          description="Les photos et vidéos apparaîtront ici dès leur publication."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item) => {
            if (item.kind === "VIDEO" || isPlayableMedia(item.url)) {
              return (
                <div key={item.id} className="min-w-0 space-y-2 sm:col-span-2">
                  <VideoEmbed url={item.url} title={item.title} poster={item.thumbnail} lazy />
                  <p className="font-display text-lg">{item.title}</p>
                  {item.category ? (
                    <p className="text-xs uppercase tracking-[0.18em] text-paper-muted">
                      {galleryCategoryLabel(item.category)}
                    </p>
                  ) : null}
                </div>
              );
            }

            const lbIndex = lightboxItems.findIndex((l) => l.src === item.url);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setIndex(lbIndex >= 0 ? lbIndex : 0)}
                className="group text-left focus-ring"
              >
                <div className="aspect-square overflow-hidden bg-ink-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.thumbnail || item.url}
                    alt={imageAlt(item.alt, item.title)}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <p className="mt-2 font-display text-lg group-hover:text-ember-text">{item.title}</p>
                {item.category ? (
                  <p className="text-xs uppercase tracking-[0.18em] text-paper-muted">
                    {galleryCategoryLabel(item.category)}
                  </p>
                ) : null}
              </button>
            );
          })}
        </div>
      )}

      <Lightbox
        items={lightboxItems}
        index={index}
        onClose={() => setIndex(null)}
        onChange={setIndex}
      />
    </div>
  );
}
