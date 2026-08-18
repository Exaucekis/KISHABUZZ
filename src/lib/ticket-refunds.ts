export function refundOrderError(params: {
  orderStatus: string;
  alreadyRefunded: boolean;
  amount: number;
  reason: string;
}) {
  if (params.alreadyRefunded || params.orderStatus === "REFUNDED") {
    return "Cette commande est déjà marquée comme remboursée.";
  }
  if (params.orderStatus !== "PAID") {
    return "Seule une commande payée peut être remboursée.";
  }
  if (params.amount <= 0) {
    return "Le montant à rembourser est invalide.";
  }
  if (!params.reason.trim() || params.reason.trim().length < 4) {
    return "Indiquez un motif (au moins 4 caractères).";
  }
  return null;
}

export function restockByTicketType(
  tickets: { ticketTypeId: string; status: string }[]
) {
  const counts = new Map<string, number>();
  for (const ticket of tickets) {
    if (ticket.status === "USED" || ticket.status === "REFUNDED") continue;
    counts.set(ticket.ticketTypeId, (counts.get(ticket.ticketTypeId) || 0) + 1);
  }
  return counts;
}

export function cancelEventError(status: string) {
  if (status === "CANCELLED") return "Cet événement est déjà annulé.";
  return null;
}
