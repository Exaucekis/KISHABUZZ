"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ScanOutcome } from "@/lib/ticket-scan-core";
import { scanResultLabel } from "@/lib/ticket-scan-core";

type EventOption = { id: string; title: string; startsAt: string };

export function ScanGate({ events, initialEventId }: { events: EventOption[]; initialEventId?: string }) {
  const [eventId, setEventId] = useState(initialEventId || events[0]?.id || "");
  const [manual, setManual] = useState("");
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState<ScanOutcome | null>(null);
  const [camError, setCamError] = useState("");
  const router = useRouter();
  const busyRef = useRef(false);
  const eventRef = useRef(eventId);
  eventRef.current = eventId;

  async function submitPayload(payload: string) {
    const value = payload.trim();
    if (!value || !eventRef.current || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const response = await fetch("/api/scan/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: value, eventId: eventRef.current }),
      });
      const outcome = (await response.json()) as ScanOutcome;
      setLast(outcome);
      router.refresh();
    } catch {
      setLast({ result: "INVALID", message: "Erreur réseau.", ticket: null });
    } finally {
      window.setTimeout(() => {
        busyRef.current = false;
        setBusy(false);
      }, 1400);
    }
  }

  useEffect(() => {
    if (!eventId) return;
    let scanner: { stop: () => Promise<void>; clear: () => void } | null = null;
    let cancelled = false;

    (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;
        const instance = new Html5Qrcode("scan-reader");
        scanner = instance;
        await instance.start(
          { facingMode: "environment" },
          { fps: 8, qrbox: { width: 240, height: 240 } },
          (decoded) => {
            void submitPayload(decoded);
          },
          () => undefined
        );
      } catch {
        if (!cancelled) setCamError("Caméra indisponible. Saisissez le code du billet.");
      }
    })();

    return () => {
      cancelled = true;
      if (scanner) {
        scanner.stop().then(() => scanner?.clear()).catch(() => undefined);
      }
    };
  }, [eventId]);

  const tone =
    last?.result === "OK"
      ? "border-emerald-400 bg-emerald-500/15 text-emerald-100"
      : last
        ? "border-red-400 bg-red-500/15 text-red-100"
        : "border-line text-paper-muted";

  return (
    <div className="space-y-5">
      <label className="block text-sm text-paper-muted">
        Événement contrôlé
        <select
          value={eventId}
          onChange={(event) => setEventId(event.target.value)}
          className="mt-2 w-full border border-line bg-ink-2 px-4 py-3 text-paper focus-ring"
        >
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>
      </label>

      <div id="scan-reader" className="overflow-hidden border border-line bg-black" />
      {camError ? <p className="text-sm text-amber-200">{camError}</p> : null}

      {last ? (
        <div className={`border px-4 py-4 ${tone}`}>
          <p className="font-display text-2xl uppercase">{scanResultLabel(last.result)}</p>
          {last.ticket ? (
            <p className="mt-2 text-sm">
              {last.ticket.holderName} · {last.ticket.ticketType}
              <span className="mt-1 block font-mono">{last.ticket.publicCode}</span>
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-paper-muted">Cadrez le QR. Un même billet ne peut entrer qu’une fois.</p>
      )}

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void submitPayload(manual);
          setManual("");
        }}
      >
        <input
          value={manual}
          onChange={(event) => setManual(event.target.value)}
          placeholder="KB-TCK-…"
          className="min-w-0 flex-1 border border-line bg-ink-2 px-4 py-3 font-mono text-sm text-paper focus-ring"
        />
        <button
          type="submit"
          disabled={busy || !eventId}
          className="rounded-md bg-ember px-4 py-3 text-sm font-bold text-on-ember disabled:opacity-50"
        >
          Valider
        </button>
      </form>
    </div>
  );
}
