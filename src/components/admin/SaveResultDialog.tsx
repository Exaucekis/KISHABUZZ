"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { AdminActionState } from "@/lib/admin";

type Props = {
  open: boolean;
  ok: boolean;
  title: string;
  description: string;
  onClose: () => void;
};

const PARTY_COLORS = ["#ffb347", "#f59e0b", "#facc15", "#34d399", "#f472b6", "#fb7185", "#fff7ed", "#22d3ee"];

function partyPieces() {
  const burst = Array.from({ length: 56 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 56 + (i % 6) * 0.12;
    const dist = 110 + (i % 10) * 42;
    return {
      key: `b${i}`,
      kind: i % 5 === 0 ? "balloon" : i % 2 === 0 ? "star" : "spark",
      wave: "burst",
      x: Math.round(Math.cos(angle) * dist),
      y: Math.round(Math.sin(angle) * dist - 24),
      r: (i * 41) % 360,
      delay: `${(i % 14) * 0.035}s`,
      color: PARTY_COLORS[i % PARTY_COLORS.length],
      size: 8 + (i % 7) * 2,
    };
  });
  const rain = Array.from({ length: 88 }, (_, i) => ({
    key: `r${i}`,
    kind: i % 7 === 0 ? "balloon" : "star",
    wave: "fall",
    x: -200 + ((i * 23) % 400),
    y: 520 + (i % 9) * 36,
    r: (i * 53) % 360,
    delay: `${0.04 + (i % 22) * 0.05}s`,
    color: PARTY_COLORS[i % PARTY_COLORS.length],
    size: 7 + (i % 8) * 2,
  }));
  return [...burst, ...rain];
}

function PartyBurst() {
  const pieces = useMemo(partyPieces, []);
  return (
    <div className="confirm-party" aria-hidden>
      {pieces.map((piece) => (
        <span
          key={piece.key}
          className={`confirm-party__piece confirm-party__piece--${piece.kind} confirm-party__piece--${piece.wave}`}
          style={{
            "--x": `${piece.x}px`,
            "--y": `${piece.y}px`,
            "--r": `${piece.r}deg`,
            "--d": piece.delay,
            "--c": piece.color,
            "--s": `${piece.size}px`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}

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
    const timer = ok ? window.setTimeout(onClose, 6200) : undefined;
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
      {ok ? <PartyBurst /> : null}
      <div
        className={`confirm-dialog-panel ${ok ? "confirm-dialog-panel--ok confirm-dialog-panel--party" : "confirm-dialog-panel--danger"}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <div className="confirm-dialog-glow" aria-hidden />
        <p className="save-result-kicker">{ok ? "C’est confirmé" : "Enregistrement impossible"}</p>
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

export function SaveResultFromState({
  state,
  titleOk = "C’est en ligne",
  titleErr = "Enregistrement impossible",
  onOk,
}: {
  state: AdminActionState;
  titleOk?: string;
  titleErr?: string;
  onOk?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const onOkRef = useRef(onOk);
  onOkRef.current = onOk;

  useEffect(() => {
    if (!state.message) return;
    setOpen(true);
    if (state.ok) onOkRef.current?.();
  }, [state]);

  return (
    <SaveResultDialog
      open={open && Boolean(state.message)}
      ok={state.ok}
      title={state.ok ? titleOk : titleErr}
      description={state.message}
      onClose={close}
    />
  );
}
