export type CoverType = {
  id: string;
  name: string;
  price: number;
  remaining: number;
  maxPerOrder: number;
  sessionIds: string[];
};

export type CoverLine = { ticketTypeId: string; name: string; unitPrice: number; perPerson: number };

export type CoverPlan = {
  ok: true;
  costPerPerson: number;
  extraDays: number;
  lines: CoverLine[];
  ticketsPerPerson: number;
};

export type CoverFail = { ok: false; message: string };

function uniqueIds(ids: string[]) {
  return Array.from(new Set(ids.filter(Boolean)));
}

export function coverageMask(sessionIds: string[], universe: string[]) {
  const wanted = new Set(sessionIds);
  let mask = 0;
  universe.forEach((id, index) => {
    if (wanted.has(id)) mask |= 1 << index;
  });
  return mask;
}

function extraBitCount(cover: number, wanted: number) {
  let extra = cover & ~wanted;
  let count = 0;
  while (extra) {
    extra &= extra - 1;
    count += 1;
  }
  return count;
}

function betterPlan(
  current: { cost: number; extra: number; picks: number[] } | null,
  next: { cost: number; extra: number; picks: number[] }
) {
  if (!current) return true;
  if (next.cost !== current.cost) return next.cost < current.cost;
  if (next.extra !== current.extra) return next.extra < current.extra;
  return next.picks.length < current.picks.length;
}

export function planTicketCover(
  wantedSessionIds: string[],
  types: CoverType[]
): CoverPlan | CoverFail {
  const wantedDays = uniqueIds(wantedSessionIds);
  if (!wantedDays.length) {
    return { ok: false, message: "Ces jours sont en entrée libre : aucun billet à acheter." };
  }

  const usable = types.filter(
    (type) => !type.sessionIds.length || type.sessionIds.some((id) => wantedDays.includes(id))
  );
  if (!usable.length) {
    return { ok: false, message: "Aucun tarif ne couvre les jours choisis." };
  }

  const universe = uniqueIds([...wantedDays, ...usable.flatMap((type) => type.sessionIds)]);
  if (universe.length > 12) {
    return { ok: false, message: "Trop de journées pour calculer la combinaison." };
  }

  const wanted = coverageMask(wantedDays, universe);
  const options = usable.map((type) => ({
    type,
    mask: coverageMask(type.sessionIds.length ? type.sessionIds : wantedDays, universe),
  }));

  const size = 1 << universe.length;
  const best: Array<{ cost: number; extra: number; picks: number[] } | null> = Array(size).fill(null);
  best[0] = { cost: 0, extra: 0, picks: [] };

  for (let i = 0; i < options.length; i += 1) {
    const option = options[i];
    if (!option.mask) continue;
    for (let mask = size - 1; mask >= 0; mask -= 1) {
      const prev = best[mask];
      if (!prev) continue;
      const nextMask = mask | option.mask;
      const next = {
        cost: prev.cost + option.type.price,
        extra: extraBitCount(nextMask, wanted),
        picks: [...prev.picks, i],
      };
      if (betterPlan(best[nextMask], next)) best[nextMask] = next;
    }
  }

  let chosen: { cost: number; extra: number; picks: number[] } | null = null;
  for (let mask = 0; mask < size; mask += 1) {
    const plan = best[mask];
    if (!plan) continue;
    if ((mask & wanted) !== wanted) continue;
    if (betterPlan(chosen, { ...plan, extra: extraBitCount(mask, wanted) })) {
      chosen = { ...plan, extra: extraBitCount(mask, wanted) };
    }
  }

  if (!chosen) {
    return { ok: false, message: "Impossible de couvrir tous les jours payants choisis." };
  }

  const merged = new Map<string, CoverLine>();
  for (const index of chosen.picks) {
    const type = options[index].type;
    const current = merged.get(type.id);
    if (current) current.perPerson += 1;
    else {
      merged.set(type.id, {
        ticketTypeId: type.id,
        name: type.name,
        unitPrice: type.price,
        perPerson: 1,
      });
    }
  }

  const lines = Array.from(merged.values());
  return {
    ok: true,
    costPerPerson: chosen.cost,
    extraDays: chosen.extra,
    lines,
    ticketsPerPerson: lines.reduce((sum, line) => sum + line.perPerson, 0),
  };
}

export function maxGroupSize(plan: CoverPlan, types: CoverType[]) {
  const byId = new Map(types.map((type) => [type.id, type]));
  return Math.min(
    ...plan.lines.map((line) => {
      const type = byId.get(line.ticketTypeId);
      if (!type) return 0;
      const perPerson = Math.max(1, line.perPerson);
      return Math.floor(Math.min(type.maxPerOrder, type.remaining) / perPerson);
    })
  );
}

export function exactCoverTypes<T extends CoverType>(wantedSessionIds: string[], types: T[]) {
  const wanted = uniqueIds(wantedSessionIds).sort().join("|");
  if (!wanted) return [] as T[];
  return types.filter((type) => {
    const ids = uniqueIds(type.sessionIds.length ? type.sessionIds : wantedSessionIds);
    return ids.sort().join("|") === wanted;
  });
}

export function scaleCover(plan: CoverPlan, people: number) {
  const quantity = Math.max(0, people);
  return {
    cost: plan.costPerPerson * quantity,
    ticketCount: plan.ticketsPerPerson * quantity,
    lines: plan.lines.map((line) => ({
      ...line,
      quantity: line.perPerson * quantity,
      subtotal: line.unitPrice * line.perPerson * quantity,
    })),
  };
}
