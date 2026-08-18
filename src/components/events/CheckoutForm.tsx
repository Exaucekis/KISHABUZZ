"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import { createTicketOrder, type OrderActionState } from "@/actions/orders";
import { formatMoney } from "@/lib/events";

type TicketOption = {
  id: string;
  name: string;
  description: string;
  benefits: string;
  price: number;
  remaining: number;
  maxPerOrder: number;
};

const initial: OrderActionState = { ok: false, message: "" };

export function CheckoutForm({
  eventId,
  currency,
  phone,
  types,
}: {
  eventId: string;
  currency: string;
  phone: string;
  types: TicketOption[];
}) {
  const [state, action, pending] = useActionState(createTicketOrder, initial);
  const [qty, setQty] = useState<Record<string, number>>(() =>
    Object.fromEntries(types.map((type) => [type.id, 0]))
  );

  const items = useMemo(
    () =>
      types
        .map((type) => ({ type, quantity: qty[type.id] || 0 }))
        .filter((item) => item.quantity > 0),
    [qty, types]
  );
  const total = items.reduce((sum, item) => sum + item.type.price * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  function setQuantity(id: string, next: number, max: number) {
    setQty((current) => ({ ...current, [id]: Math.max(0, Math.min(max, next)) }));
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="eventId" value={eventId} />
      {types.map((type) => {
        const max = Math.min(type.maxPerOrder, type.remaining);
        const value = qty[type.id] || 0;
        return (
          <div key={type.id} className="border-b border-line pb-4 last:border-0">
            <input type="hidden" name={`qty_${type.id}`} value={value} />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold">{type.name}</p>
                {type.benefits || type.description ? (
                  <p className="mt-1 text-sm text-paper-muted">{type.benefits || type.description}</p>
                ) : null}
                <p className="mt-2 text-xs uppercase tracking-wide text-paper-muted">
                  {type.remaining
                    ? `${type.remaining} place${type.remaining > 1 ? "s" : ""} restante${type.remaining > 1 ? "s" : ""}`
                    : "Complet"}
                </p>
              </div>
              <p className="shrink-0 font-display text-lg">
                {type.price ? formatMoney(type.price, currency) : "Gratuit"}
              </p>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                disabled={pending || value <= 0}
                onClick={() => setQuantity(type.id, value - 1, max)}
                className="grid h-9 w-9 place-items-center border border-line text-lg disabled:opacity-40"
                aria-label={`Retirer un billet ${type.name}`}
              >
                −
              </button>
              <span className="w-6 text-center font-semibold">{value}</span>
              <button
                type="button"
                disabled={pending || value >= max || max <= 0}
                onClick={() => setQuantity(type.id, value + 1, max)}
                className="grid h-9 w-9 place-items-center border border-line text-lg disabled:opacity-40"
                aria-label={`Ajouter un billet ${type.name}`}
              >
                +
              </button>
            </div>
          </div>
        );
      })}

      <div>
        <label htmlFor="phone" className="mb-2 block text-sm text-paper-muted">
          Téléphone Mobile Money *
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          defaultValue={phone}
          autoComplete="tel"
          placeholder="0974 105 940"
          className="w-full border border-line bg-ink-2 px-4 py-3 text-paper focus-ring"
        />
        {state.fieldErrors?.phone?.[0] ? (
          <p className="mt-1 text-sm text-red-400">{state.fieldErrors.phone[0]}</p>
        ) : (
          <p className="mt-1 text-xs text-paper-muted">Utilisé pour CinetPay (Orange Money, M-Pesa, Airtel Money…).</p>
        )}
      </div>

      <div className="flex items-end justify-between gap-4 border-t border-line pt-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-paper-muted">Total</p>
          <p className="font-display text-2xl">{formatMoney(total, currency)}</p>
          <p className="text-sm text-paper-muted">
            {count ? `${count} billet${count > 1 ? "s" : ""} · réservation 15 min` : "Aucun billet sélectionné"}
          </p>
        </div>
        <button
          type="submit"
          disabled={pending || count === 0}
          className="rounded-md bg-ember px-5 py-3 text-sm font-bold text-on-ember hover:bg-ember-hot disabled:opacity-50"
        >
          {pending ? "Redirection…" : total === 0 ? "Obtenir mes billets" : "Payer avec CinetPay"}
        </button>
      </div>
      {state.message ? <p className="text-sm text-red-400">{state.message}</p> : null}
    </form>
  );
}
