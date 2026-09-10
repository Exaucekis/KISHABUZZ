"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { refundPaidOrderAction } from "@/actions/ticketing";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { AdminActionState } from "@/lib/admin";
import { formatMoney } from "@/lib/events";

const initial: AdminActionState = { ok: false, message: "" };

export function RefundOrderForm({
  orderId,
  amount,
  currency,
  variant = "site",
}: {
  orderId: string;
  amount: number;
  currency: string;
  variant?: "site" | "admin";
}) {
  const [state, action] = useActionState(refundPaidOrderAction, initial);
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const btn =
    variant === "admin"
      ? "admin-btn admin-btn-danger text-xs"
      : "rounded-md border border-line px-3 py-1.5 text-xs hover:border-ember";

  useEffect(() => {
    if (!state.ok) return;
    const frame = window.requestAnimationFrame(() => setOpen(false));
    return () => window.cancelAnimationFrame(frame);
  }, [state.ok]);

  return (
    <div>
      <form ref={formRef} action={action} className="space-y-2">
        <input type="hidden" name="orderId" value={orderId} />
        <label className="block text-xs text-paper-muted">
          Motif
          <input
            name="reason"
            required
            minLength={4}
            placeholder="Annulation, doublon, demande client…"
            className={
              variant === "admin"
                ? "mt-1 w-full"
                : "mt-1 w-full border border-line bg-ink px-2 py-1.5 text-sm"
            }
          />
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" name="restock" defaultChecked />
          Remettre les places non utilisées en stock
        </label>
        <button type="button" className={btn} onClick={() => setOpen(true)}>
          Marquer remboursé
        </button>
      </form>
      <ConfirmDialog
        open={open}
        variant="danger"
        title="Enregistrer ce remboursement ?"
        description={`Confirmez d’abord le remboursement de ${formatMoney(amount, currency)} dans CinetPay, puis validez ici. Cette action est définitive.`}
        confirmLabel="Oui, marquer remboursé"
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false);
          formRef.current?.requestSubmit();
        }}
      />
      {state.message ? (
        <p className={`mt-2 text-xs ${state.ok ? "text-emerald-300" : "text-red-300"}`}>{state.message}</p>
      ) : null}
    </div>
  );
}
