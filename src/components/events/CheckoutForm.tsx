"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import { createTicketOrder, type OrderActionState } from "@/actions/orders";
import { formatMoney, RESERVATION_MINUTES } from "@/lib/events";
import { planTicketCover, scaleCover, type CoverType } from "@/lib/ticket-cover";

type TicketOption = CoverType & {
  description: string;
  benefits: string;
  validity?: string;
};

type DayOption = {
  id: string;
  label: string;
  access: "PAID" | "FREE";
};

const initial: OrderActionState = { ok: false, message: "" };

function capFor(type: TicketOption) {
  return Math.max(0, Math.min(type.remaining, type.maxPerOrder));
}

export function CheckoutForm({
  eventId,
  currency,
  phone,
  types,
  days,
}: {
  eventId: string;
  currency: string;
  phone: string;
  types: TicketOption[];
  days: DayOption[];
}) {
  const [state, action, pending] = useActionState(createTicketOrder, initial);
  const paidDays = days.filter((day) => day.access === "PAID");
  const freeDays = days.filter((day) => day.access === "FREE");
  const [selectedDays, setSelectedDays] = useState<string[]>(() => paidDays.map((day) => day.id));
  const [qty, setQty] = useState<Record<string, number>>(() =>
    Object.fromEntries(types.map((type) => [type.id, 0]))
  );
  const [helperPeople, setHelperPeople] = useState(1);

  const coverTypes: CoverType[] = types.map((type) => ({
    id: type.id,
    name: type.name,
    price: type.price,
    remaining: type.remaining,
    maxPerOrder: type.maxPerOrder,
    sessionIds: type.sessionIds,
  }));

  const wantedDays = paidDays.length <= 1 ? paidDays.map((day) => day.id) : selectedDays;
  const cheapest = useMemo(() => planTicketCover(wantedDays, coverTypes), [wantedDays, coverTypes]);

  function setTypeQty(id: string, next: number) {
    const type = types.find((row) => row.id === id);
    if (!type) return;
    const value = Math.max(0, Math.min(capFor(type), Math.trunc(next)));
    setQty((current) => ({ ...current, [id]: value }));
  }

  function applyBestPrice() {
    if (!cheapest.ok) return;
    const cap = Math.min(
      50,
      ...cheapest.lines.map((line) => {
        const type = types.find((row) => row.id === line.ticketTypeId);
        if (!type) return 0;
        return Math.floor(capFor(type) / Math.max(1, line.perPerson));
      })
    );
    const people = Math.max(1, Math.min(helperPeople, cap || 1));
    const scaled = scaleCover(cheapest, people);
    const next = Object.fromEntries(types.map((type) => [type.id, 0]));
    for (const line of scaled.lines) {
      next[line.ticketTypeId] = (next[line.ticketTypeId] || 0) + line.quantity;
    }
    setQty(next);
    setHelperPeople(people);
  }

  function toggleDay(id: string) {
    setSelectedDays((current) => {
      const next = current.includes(id) ? current.filter((day) => day !== id) : [...current, id];
      return next;
    });
  }

  const lines = types
    .map((type) => {
      const quantity = qty[type.id] || 0;
      return {
        type,
        quantity,
        subtotal: type.price * quantity,
      };
    })
    .filter((line) => line.quantity > 0);
  const ticketCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const cost = lines.reduce((sum, line) => sum + line.subtotal, 0);
  const canPay = ticketCount > 0;

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="eventId" value={eventId} />
      {types.map((type) => (
        <input key={type.id} type="hidden" name={`qty_${type.id}`} value={qty[type.id] || 0} />
      ))}

      {paidDays.length > 1 ? (
        <div>
          <p className="text-sm font-semibold">Quels jours payants ?</p>
          <p className="mt-1 text-xs text-paper-muted">
            Sert à proposer le meilleur prix. Chaque tarif a déjà ses jours de validité.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {paidDays.map((day) => {
              const checked = selectedDays.includes(day.id);
              return (
                <label key={day.id} className="flex cursor-pointer items-start gap-3 border border-line px-3 py-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleDay(day.id)}
                    disabled={pending}
                    className="mt-1"
                  />
                  <span>{day.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      ) : null}

      {freeDays.length ? (
        <p className="text-sm text-paper-muted">
          Entrée libre, sans billet : {freeDays.map((day) => day.label).join(" · ")}.
        </p>
      ) : null}

      <div>
        <p className="text-sm font-semibold">Billets du groupe</p>
        <p className="mt-1 text-xs text-paper-muted">
          Mélangez les catégories dans la même commande : 2 VVIP, 2 VIP et 1 Standard, un seul
          paiement.
        </p>
        <ul className="mt-4 space-y-3">
          {types.map((type) => {
            const quantity = qty[type.id] || 0;
            const cap = capFor(type);
            return (
              <li key={type.id} className="border border-line px-3 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{type.name}</p>
                    {type.benefits || type.description ? (
                      <p className="mt-1 text-sm text-paper-muted">{type.benefits || type.description}</p>
                    ) : null}
                    {type.validity ? (
                      <p className="mt-1 text-xs uppercase tracking-wide text-ember-text">{type.validity}</p>
                    ) : null}
                    <p className="mt-1 text-sm">{formatMoney(type.price, currency)}</p>
                    <p className="mt-1 text-xs text-paper-muted">
                      {type.remaining} place{type.remaining > 1 ? "s" : ""} · max {type.maxPerOrder} par
                      commande
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      disabled={pending || quantity <= 0}
                      onClick={() => setTypeQty(type.id, quantity - 1)}
                      className="grid h-10 w-10 place-items-center border border-line text-lg disabled:opacity-40"
                      aria-label={`Retirer un billet ${type.name}`}
                    >
                      −
                    </button>
                    <span className="min-w-8 text-center font-display text-2xl">{quantity}</span>
                    <button
                      type="button"
                      disabled={pending || quantity >= cap}
                      onClick={() => setTypeQty(type.id, quantity + 1)}
                      className="grid h-10 w-10 place-items-center border border-line text-lg disabled:opacity-40"
                      aria-label={`Ajouter un billet ${type.name}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {paidDays.length > 1 && cheapest.ok ? (
        <div className="border border-line px-3 py-3">
          <p className="text-sm font-semibold">Ou laisser le site choisir le moins cher</p>
          <p className="mt-1 text-xs text-paper-muted">
            Même formule pour tout le monde, selon les jours cochés. Vous pouvez ensuite ajuster
            les quantités ci-dessus.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pending || helperPeople <= 1}
                onClick={() => setHelperPeople((value) => Math.max(1, value - 1))}
                className="grid h-9 w-9 place-items-center border border-line disabled:opacity-40"
                aria-label="Moins de personnes"
              >
                −
              </button>
              <span className="min-w-8 text-center font-display text-xl">{helperPeople}</span>
              <button
                type="button"
                disabled={pending}
                onClick={() => setHelperPeople((value) => value + 1)}
                className="grid h-9 w-9 place-items-center border border-line disabled:opacity-40"
                aria-label="Plus de personnes"
              >
                +
              </button>
            </div>
            <button
              type="button"
              disabled={pending}
              onClick={applyBestPrice}
              className="rounded-md border border-ember px-3 py-2 text-sm font-semibold text-ember-text"
            >
              Remplir {formatMoney(cheapest.costPerPerson, currency)} / pers.
            </button>
          </div>
        </div>
      ) : null}

      <div className="border border-line bg-ink px-4 py-4">
        <p className="text-xs uppercase tracking-wide text-paper-muted">Récapitulatif</p>
        {lines.length ? (
          <>
            <ul className="mt-3 space-y-1 text-sm">
              {lines.map((line) => (
                <li key={line.type.id}>
                  {line.quantity} × {line.type.name} · {formatMoney(line.subtotal, currency)}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-paper-muted">
              {ticketCount} billet{ticketCount > 1 ? "s" : ""} pour {ticketCount} personne
              {ticketCount > 1 ? "s" : ""}, envoyé{ticketCount > 1 ? "s" : ""} sur le compte après
              paiement.
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-paper-muted">Ajoutez au moins un billet.</p>
        )}
      </div>

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
          <p className="mt-1 text-xs text-paper-muted">
            Un seul paiement CinetPay pour tout le groupe (Orange Money, M-Pesa, Airtel Money…).
          </p>
        )}
      </div>

      <div className="flex items-end justify-between gap-4 border-t border-line pt-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-paper-muted">Total</p>
          <p className="font-display text-2xl">{formatMoney(cost, currency)}</p>
          <p className="text-sm text-paper-muted">
            {ticketCount
              ? `${ticketCount} billet${ticketCount > 1 ? "s" : ""} · réservation ${RESERVATION_MINUTES} min`
              : "Aucun billet"}
          </p>
        </div>
        <button
          type="submit"
          disabled={pending || !canPay}
          className="rounded-md bg-ember px-5 py-3 text-sm font-bold text-on-ember hover:bg-ember-hot disabled:opacity-50"
        >
          {pending ? "Redirection…" : cost === 0 ? "Obtenir mes billets" : "Payer avec CinetPay"}
        </button>
      </div>
      {state.message ? <p className="text-sm text-red-400">{state.message}</p> : null}
    </form>
  );
}
