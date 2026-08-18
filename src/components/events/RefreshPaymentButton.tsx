"use client";

import { useActionState } from "react";
import { refreshTicketPayment, type OrderActionState } from "@/actions/orders";

const initial: OrderActionState = { ok: false, message: "" };

export function RefreshPaymentButton({ orderId }: { orderId: string }) {
  const [state, action, pending] = useActionState(refreshTicketPayment, initial);

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="orderId" value={orderId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-line px-5 py-3 text-sm font-semibold hover:border-ember disabled:opacity-50"
      >
        {pending ? "Vérification…" : "J’ai déjà payé — actualiser"}
      </button>
      {state.message ? <p className="text-sm text-paper-muted">{state.message}</p> : null}
    </form>
  );
}
