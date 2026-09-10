"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { cancelEventAction } from "@/actions/ticketing";
import { AdminHint } from "@/components/admin/AdminHint";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { AdminActionState } from "@/lib/admin";

const initial: AdminActionState = { ok: false, message: "" };

export function EventCancelForm({ eventId, disabled }: { eventId: string; disabled?: boolean }) {
  const [state, action] = useActionState(cancelEventAction, initial);
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.ok) return;
    const frame = window.requestAnimationFrame(() => setOpen(false));
    return () => window.cancelAnimationFrame(frame);
  }, [state.ok]);

  return (
    <div className="admin-card mt-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[#9aa3b5]">Annuler l’événement</h2>
      <AdminHint>
        Stoppe les ventes, libère les réservations non payées et invalide les billets encore valides. Les
        remboursements CinetPay restent manuels, commande par commande.
      </AdminHint>
      <form ref={formRef} action={action} className="mt-4">
        <input type="hidden" name="eventId" value={eventId} />
        <button
          type="button"
          className="admin-btn admin-btn-danger"
          disabled={disabled}
          onClick={() => setOpen(true)}
        >
          Annuler l’événement
        </button>
      </form>
      <ConfirmDialog
        open={open}
        variant="danger"
        title="Annuler cet événement ?"
        description="Les billets non scannés seront invalidés. Les commandes payées restent à rembourser une par une (CinetPay + marqueur interne)."
        confirmLabel="Oui, annuler"
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false);
          formRef.current?.requestSubmit();
        }}
      />
      {state.message ? (
        <p className={`mt-3 text-sm ${state.ok ? "text-emerald-300" : "text-red-300"}`}>{state.message}</p>
      ) : null}
    </div>
  );
}
