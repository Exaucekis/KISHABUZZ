"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Share2, X, ZoomIn, ZoomOut } from "lucide-react";

type Item = {
  src: string;
  alt?: string;
  title?: string;
};

type Props = {
  items: Item[];
  index: number | null;
  onClose: () => void;
  onChange: (index: number) => void;
};

export function Lightbox({ items, index, onClose, onChange }: Props) {
  const open = index !== null && Boolean(items[index]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && index !== null) onChange((index + 1) % items.length);
      if (e.key === "ArrowLeft" && index !== null)
        onChange((index - 1 + items.length) % items.length);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, index, items.length, onChange, onClose]);

  if (!open || index === null) return null;

  return (
    <LightboxStage
      key={index}
      item={items[index]}
      index={index}
      count={items.length}
      onClose={onClose}
      onChange={onChange}
    />
  );
}

function LightboxStage({
  item,
  index,
  count,
  onClose,
  onChange,
}: {
  item: Item;
  index: number;
  count: number;
  onClose: () => void;
  onChange: (index: number) => void;
}) {
  const [zoom, setZoom] = useState(1);

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      await navigator.share({ title: item.title || "KISHA BUZZ", url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Visionneuse photo"
    >
      <button
        type="button"
        className="absolute right-4 top-4 rounded-md border border-white/20 p-2 text-white focus-ring"
        onClick={onClose}
        aria-label="Fermer"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="absolute left-4 top-4 flex gap-2">
        <button
          type="button"
          className="rounded-md border border-white/20 p-2 text-white"
          onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
          aria-label="Zoom avant"
        >
          <ZoomIn className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="rounded-md border border-white/20 p-2 text-white"
          onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
          aria-label="Zoom arrière"
        >
          <ZoomOut className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="rounded-md border border-white/20 p-2 text-white"
          onClick={share}
          aria-label="Partager"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </div>

      {count > 1 ? (
        <>
          <button
            type="button"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 p-3 text-white"
            onClick={() => onChange((index - 1 + count) % count)}
            aria-label="Précédent"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 p-3 text-white"
            onClick={() => onChange((index + 1) % count)}
            aria-label="Suivant"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      ) : null}

      <div className="max-h-[85vh] max-w-6xl overflow-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.src}
          alt={item.alt || item.title || ""}
          className="mx-auto max-h-[80vh] object-contain transition"
          style={{ transform: `scale(${zoom})` }}
        />
        {item.title ? <p className="mt-4 text-center text-sm text-white/70">{item.title}</p> : null}
      </div>
    </div>
  );
}
