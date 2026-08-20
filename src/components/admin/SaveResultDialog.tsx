"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

type Props = {
  open: boolean;
  ok: boolean;
  title: string;
  description: string;
  onClose: () => void;
};

export function SaveResultDialog({ open, ok, title, description, onClose }: Props) {
  const titleId = useId();
  const descId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const timer = ok ? window.setTimeout(onClose, 5200) : undefined;
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      if (timer) window.clearTimeout(timer);
    };
  }, [open, ok, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="confirm-dialog-root" role="presentation">
      <button type="button" className="confirm-dialog-backdrop" aria-label="Fermer" onClick={onClose} />
      <div
        className={`confirm-dialog-panel ${ok ? "confirm-dialog-panel--ok" : "confirm-dialog-panel--danger"}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <div className="confirm-dialog-glow" aria-hidden />
        <p className="save-result-kicker">{ok ? "Enregistrement confirmé" : "Enregistrement impossible"}</p>
        <div className="save-result-head">
          {ok ? (
            <CheckCircle2 className="save-result-icon save-result-icon--ok" aria-hidden />
          ) : (
            <AlertTriangle className="save-result-icon save-result-icon--err" aria-hidden />
          )}
          <p id={titleId} className="confirm-dialog-title">
            {title}
          </p>
        </div>
        <p id={descId} className="confirm-dialog-desc">
          {description}
        </p>
        <div className="confirm-dialog-actions">
          <button
            ref={closeRef}
            type="button"
            className={`confirm-dialog-btn ${ok ? "confirm-dialog-btn--primary" : "confirm-dialog-btn--danger"}`}
            onClick={onClose}
          >
            {ok ? "Parfait" : "Fermer"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
