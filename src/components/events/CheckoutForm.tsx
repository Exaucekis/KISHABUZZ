"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import { createTicketOrder, type OrderActionState } from "@/actions/orders";
import { formatMoney, RESERVATION_MINUTES } from "@/lib/events";
import { exactCoverTypes, maxGroupSize, planTicketCover, scaleCover, type CoverType } from "@/lib/ticket-cover";

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

function asCoverPlanFromType(type: TicketOption) {
  return {
    ok: true as const,
    costPerPerson: type.price,
    extraDays: 0,
    ticketsPerPerson: 1,
    lines: [{ ticketTypeId: type.id, name: type.name, unitPrice: type.price, perPerson: 1 }],
  };
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
  const [people, setPeople] = useState(1);
  const [selectedDays, setSelectedDays] = useState<string[]>(() => paidDays.map((day) => day.id));
  const [formulaId, setFormulaId] = useState("best");

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
  const exact = useMemo(() => exactCoverTypes(wantedDays, types), [wantedDays, types]);

  const formulas = useMemo(() => {
    const rows: { id: string; label: string; hint: string; plan: ReturnType<typeof asCoverPlanFromType> }[] = [];
    if (cheapest.ok) {
      rows.push({
        id: "best",
        label: cheapest.lines.length === 1 ? cheapest.lines[0].name : "Meilleur prix",
        hint:
          cheapest.lines.length === 1
            ? cheapest.extraDays
              ? "Couvre aussi un jour de plus"
              : "Combinaison la moins chère"
            : cheapest.lines.map((line) => line.name).join(" + "),
        plan: cheapest,
      });
    }
    for (const type of exact) {
      if (rows.some((row) => row.plan.lines.length === 1 && row.plan.lines[0].ticketTypeId === type.id)) {
        continue;
      }
      rows.push({
        id: type.id,
        label: type.name,
        hint: type.validity || type.benefits || type.description || "Un billet pour tous les jours choisis",
        plan: asCoverPlanFromType(type),
      });
    }
    return rows;
  }, [cheapest, exact]);

  const activeFormula = formulas.find((row) => row.id === formulaId) || formulas[0];
  const plan = activeFormula?.plan;
  const cap = plan?.ok ? Math.max(0, maxGroupSize(plan, coverTypes)) : 0;
  const safePeople = Math.min(people, cap || people);
  const scaled = plan?.ok ? scaleCover(plan, safePeople) : null;

  function toggleDay(id: string) {
    setSelectedDays((current) => {
      const next = current.includes(id) ? current.filter((day) => day !== id) : [...current, id];
      return next;
    });
    setFormulaId("best");
  }

  const qtyByType = Object.fromEntries(types.map((type) => [type.id, 0]));
  if (scaled) {
    for (const line of scaled.lines) qtyByType[line.ticketTypeId] = line.quantity;
  }

  const canPay = Boolean(plan?.ok && scaled && scaled.ticketCount > 0 && cap > 0 && safePeople > 0);

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="eventId" value={eventId} />
      {types.map((type) => (
        <input key={type.id} type="hidden" name={`qty_${type.id}`} value={qtyByType[type.id] || 0} />
      ))}

      <div>
        <p className="text-sm font-semibold">Combien de personnes ?</p>
        <p className="mt-1 text-xs text-paper-muted">
          Même jours pour tout le groupe. Un paiement, plusieurs billets.
        </p>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            disabled={pending || safePeople <= 1}
            onClick={() => setPeople((value) => Math.max(1, value - 1))}
            className="grid h-10 w-10 place-items-center border border-line text-lg disabled:opacity-40"
            aria-label="Retirer une personne"
          >
            −
          </button>
          <span className="min-w-10 text-center font-display text-2xl">{safePeople}</span>
          <button
            type="button"
            disabled={pending || cap <= 0 || safePeople >= cap}
            onClick={() => setPeople((value) => value + 1)}
            className="grid h-10 w-10 place-items-center border border-line text-lg disabled:opacity-40"
            aria-label="Ajouter une personne"
          >
            +
          </button>
        </div>
        {cap > 0 ? (
          <p className="mt-2 text-xs text-paper-muted">Maximum {cap} pour cette sélection (stock et limite par commande).</p>
        ) : null}
      </div>

      {paidDays.length > 1 ? (
        <div>
          <p className="text-sm font-semibold">Quels jours payants ?</p>
          <p className="mt-1 text-xs text-paper-muted">Décochez si tout le groupe ne vient pas certains jours.</p>
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

      {formulas.length > 1 ? (
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">Formule</legend>
          {formulas.map((formula) => (
            <label
              key={formula.id}
              className={`flex cursor-pointer items-start gap-3 border px-3 py-3 ${
                activeFormula?.id === formula.id ? "border-ember" : "border-line"
              }`}
            >
              <input
                type="radio"
                name="formula"
                checked={activeFormula?.id === formula.id}
                onChange={() => setFormulaId(formula.id)}
                disabled={pending}
                className="mt-1"
              />
              <span>
                <span className="block font-semibold">{formula.label}</span>
                <span className="mt-1 block text-xs text-paper-muted">{formula.hint}</span>
                <span className="mt-1 block text-sm">
                  {formatMoney(formula.plan.costPerPerson, currency)} / personne
                </span>
              </span>
            </label>
          ))}
        </fieldset>
      ) : null}

      <div className="border border-line bg-ink px-4 py-4">
        <p className="text-xs uppercase tracking-wide text-paper-muted">Récapitulatif</p>
        {!plan?.ok || !scaled || !wantedDays.length ? (
          <p className="mt-2 text-sm text-paper-muted">
            {cheapest.ok === false ? cheapest.message : "Choisissez au moins un jour payant."}
          </p>
        ) : (
          <>
            <ul className="mt-3 space-y-1 text-sm">
              {scaled.lines.map((line) => (
                <li key={line.ticketTypeId}>
                  {line.quantity} × {line.name} · {formatMoney(line.subtotal, currency)}
                </li>
              ))}
            </ul>
            {plan.ticketsPerPerson > 1 ? (
              <p className="mt-2 text-xs text-paper-muted">
                Chaque personne reçoit {plan.ticketsPerPerson} billets (un par tarif de la combinaison).
              </p>
            ) : (
              <p className="mt-2 text-xs text-paper-muted">
                {safePeople} billet{safePeople > 1 ? "s" : ""} envoyé{safePeople > 1 ? "s" : ""} sur le compte
                après paiement.
              </p>
            )}
            {plan.extraDays ? (
              <p className="mt-2 text-xs text-ember-text">
                Cette formule couvre aussi un jour de plus que votre sélection.
              </p>
            ) : null}
          </>
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
          <p className="font-display text-2xl">{formatMoney(scaled?.cost || 0, currency)}</p>
          <p className="text-sm text-paper-muted">
            {scaled?.ticketCount
              ? `${scaled.ticketCount} billet${scaled.ticketCount > 1 ? "s" : ""} · réservation ${RESERVATION_MINUTES} min`
              : "Aucun billet"}
          </p>
        </div>
        <button
          type="submit"
          disabled={pending || !canPay}
          className="rounded-md bg-ember px-5 py-3 text-sm font-bold text-on-ember hover:bg-ember-hot disabled:opacity-50"
        >
          {pending ? "Redirection…" : (scaled?.cost || 0) === 0 ? "Obtenir mes billets" : "Payer avec CinetPay"}
        </button>
      </div>
      {state.message ? <p className="text-sm text-red-400">{state.message}</p> : null}
    </form>
  );
}
