"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { coverFocusStyle, formatCoverFocus, parseCoverFocus } from "@/lib/cover-focus";

export function CoverCropper({
  open,
  src,
  value,
  onApply,
  onClose,
}: {
  open: boolean;
  src: string;
  value: string;
  onApply: (next: string) => void;
  onClose: () => void;
}) {
  const [focus, setFocus] = useState(parseCoverFocus(value));
  const stageRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => setFocus(parseCoverFocus(value)));
    return () => window.cancelAnimationFrame(frame);
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  function pointFromEvent(event: { clientX: number; clientY: number }) {
    const box = stageRef.current?.getBoundingClientRect();
    if (!box) return;
    const x = ((event.clientX - box.left) / box.width) * 100;
    const y = ((event.clientY - box.top) / box.height) * 100;
    setFocus({ x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) });
  }

  if (!open) return null;

  const formatted = formatCoverFocus(focus.x, focus.y);

  return createPortal(
    <div className="cover-crop-root" role="dialog" aria-modal="true" aria-labelledby="cover-crop-title">
      <button type="button" className="cover-crop-backdrop" aria-label="Fermer" onClick={onClose} />
      <div className="cover-crop-panel">
        <div className="cover-crop-head">
          <div>
            <h2 id="cover-crop-title" className="text-lg font-semibold">
              Recadrer la couverture
            </h2>
            <p className="cover-crop-sub">
              Cliquez le visage ou le sujet. Les aperçus montrent la carte et la une.
            </p>
          </div>
          <button type="button" className="cover-crop-close" onClick={onClose}>
            Fermer
          </button>
        </div>

        <div
          ref={stageRef}
          className="cover-crop-stage"
          onPointerDown={(event) => {
            dragging.current = true;
            (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
            pointFromEvent(event);
          }}
          onPointerMove={(event) => {
            if (dragging.current) pointFromEvent(event);
          }}
          onPointerUp={() => {
            dragging.current = false;
          }}
          onPointerCancel={() => {
            dragging.current = false;
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" draggable={false} />
          <span className="cover-crop-mark" style={{ left: `${focus.x}%`, top: `${focus.y}%` }} />
        </div>

        <div className="cover-crop-previews">
          <figure>
            <div className="cover-crop-frame cover-crop-frame--card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" style={coverFocusStyle(formatted)} />
            </div>
            <figcaption>Carte (liste)</figcaption>
          </figure>
          <figure>
            <div className="cover-crop-frame cover-crop-frame--hero">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" style={coverFocusStyle(formatted)} />
            </div>
            <figcaption>Une (article)</figcaption>
          </figure>
        </div>

        <div className="cover-crop-actions">
          <button type="button" className="cover-crop-close" onClick={onClose}>
            Annuler
          </button>
          <button
            type="button"
            className="cover-crop-apply"
            onClick={() => {
              onApply(formatted);
              onClose();
            }}
          >
            Appliquer
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
