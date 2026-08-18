export const LIVE_EVENT_STATUSES = ["PUBLISHED", "SOLD_OUT"] as const;

export function sumTicketQuantities(quantities: number[]) {
  return quantities.reduce((sum, n) => sum + Math.max(0, Math.trunc(n) || 0), 0);
}

export function isLiveEventStatus(status: string) {
  return (LIVE_EVENT_STATUSES as readonly string[]).includes(status);
}

export function eventCapacityError(params: {
  capacity: number;
  status: string;
  quantities: number[];
  takenSeats?: number;
}): string | null {
  const capacity = Math.trunc(params.capacity) || 0;
  const sum = sumTicketQuantities(params.quantities);
  const taken = Math.max(0, params.takenSeats ?? 0);

  if (capacity < 0) return "La capacité ne peut pas être négative.";

  if (isLiveEventStatus(params.status)) {
    if (capacity <= 0) {
      return "Indiquez une capacité globale avant de publier (jauge de la salle).";
    }
    if (!params.quantities.length || sum <= 0) {
      return "Ajoutez au moins un tarif avec un stock avant de publier.";
    }
  }

  if (capacity > 0 && sum > capacity) {
    return `La somme des tarifs (${sum} places) dépasse la capacité (${capacity}).`;
  }

  if (capacity > 0 && capacity < taken) {
    return `Impossible de descendre la capacité à ${capacity} : ${taken} place(s) déjà vendue(s) ou réservée(s).`;
  }

  return null;
}

export function ticketQuantityFloorError(
  name: string,
  quantity: number,
  soldCount: number,
  reservedCount: number
) {
  const taken = soldCount + reservedCount;
  if (quantity < taken) {
    return `Stock trop bas pour « ${name} » : ${taken} place(s) déjà prises.`;
  }
  return null;
}
