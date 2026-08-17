"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "default" | "danger";
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  loading = false,
  onConfirm,
  onCancel,
  variant = "default",
}: Props) {
  const titleId = useId();
  const descId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, loading, onCancel]);

  if (!open) return null;

  return createPortal(
    <div className="confirm-dialog-root" role="presentation">
      <button
        type="button"
        className="confirm-dialog-backdrop"
        aria-label="Fermer la fenêtre"
        disabled={loading}
        onClick={onCancel}
      />
      <div
        className={cn("confirm-dialog-panel", variant === "danger" && "confirm-dialog-panel--danger")}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <div className="confirm-dialog-glow" aria-hidden />
        <p id={titleId} className="confirm-dialog-title">
          {title}
        </p>
        <p id={descId} className="confirm-dialog-desc">
          {description}
        </p>
        <div className="confirm-dialog-actions">
          <button
            ref={cancelRef}
            type="button"
            className="confirm-dialog-btn confirm-dialog-btn--ghost"
            disabled={loading}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={cn(
              "confirm-dialog-btn",
              variant === "danger" ? "confirm-dialog-btn--danger" : "confirm-dialog-btn--primary"
            )}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? "Patientez…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
