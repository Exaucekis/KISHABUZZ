"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { listLibraryItems } from "@/actions/admin/library";
import { isPlayableMedia } from "@/lib/media";
import type { LibraryItem } from "@/lib/library";

export function LibraryPicker({
  open,
  kind,
  onSelect,
  onClose,
}: {
  open: boolean;
  kind: "image" | "video" | "any";
  onSelect: (url: string) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    const frame = window.requestAnimationFrame(() => setLoading(true));
    void listLibraryItems(kind)
      .then(setItems)
      .finally(() => setLoading(false));
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      window.cancelAnimationFrame(frame);
    };
  }, [open, kind]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => `${item.title} ${item.url}`.toLowerCase().includes(q));
  }, [items, query]);

  if (!open) return null;

  return createPortal(
    <div className="library-picker-root" role="presentation">
      <button type="button" className="library-picker-backdrop" aria-label="Fermer" onClick={onClose} />
      <div className="library-picker-panel" role="dialog" aria-modal="true" aria-label="Bibliothèque média">
        <div className="library-picker-head">
          <div>
            <p className="library-picker-title">Bibliothèque</p>
            <p className="library-picker-sub">Réutilisez un fichier déjà envoyé.</p>
          </div>
          <button type="button" className="library-picker-close" onClick={onClose}>
            Fermer
          </button>
        </div>
        <input
          className="library-picker-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher…"
        />
        {loading ? (
          <p className="library-picker-empty">Chargement…</p>
        ) : !filtered.length ? (
          <p className="library-picker-empty">Aucun média. Téléversez d’abord un fichier.</p>
        ) : (
          <div className="library-picker-grid">
            {filtered.map((item) => {
              const video = item.kind === "VIDEO" || isPlayableMedia(item.url);
              return (
                <button
                  key={item.url}
                  type="button"
                  className="library-picker-item"
                  title={item.title}
                  onClick={() => {
                    onSelect(item.url);
                    onClose();
                  }}
                >
                  {video ? (
                    <span className="library-picker-video">▶</span>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.url} alt="" />
                  )}
                  <span>{item.title}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
