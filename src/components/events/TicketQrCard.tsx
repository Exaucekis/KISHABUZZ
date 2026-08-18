"use client";

import { useState } from "react";

export function TicketQrCard({ dataUrl, code }: { dataUrl: string; code: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full border border-line bg-white p-5 text-left"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUrl} alt={`QR du billet ${code}`} className="mx-auto h-56 w-56" />
        <p className="mt-3 text-center font-mono text-sm text-ink">{code}</p>
        <p className="mt-1 text-center text-xs text-paper-muted">Toucher pour afficher en plein écran</p>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[80] flex flex-col bg-white px-6 py-10">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-ember">
            Présentez ce QR à l’entrée
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dataUrl} alt="" className="mx-auto mt-8 h-[min(70vw,22rem)] w-[min(70vw,22rem)]" />
          <p className="mt-6 text-center font-mono text-lg text-ink">{code}</p>
          <p className="mt-2 text-center text-sm text-neutral-500">Augmentez la luminosité de l’écran.</p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mx-auto mt-8 rounded-md bg-ink px-5 py-3 text-sm font-bold text-white"
          >
            Fermer
          </button>
        </div>
      ) : null}
    </>
  );
}
