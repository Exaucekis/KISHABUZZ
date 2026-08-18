export const SCAN_RESULTS = ["OK", "ALREADY_USED", "INVALID", "WRONG_EVENT", "UNPAID", "CANCELLED", "REFUNDED"] as const;
export type ScanResultCode = (typeof SCAN_RESULTS)[number];

export type ScanOutcome = {
  result: ScanResultCode;
  message: string;
  ticket: null | {
    publicCode: string;
    holderName: string;
    ticketType: string;
    eventTitle: string;
    status: string;
  };
};

export function scanResultLabel(result: string) {
  const map: Record<string, string> = {
    OK: "Entrée validée",
    ALREADY_USED: "Déjà scanné",
    INVALID: "Billet invalide",
    WRONG_EVENT: "Mauvais événement",
    UNPAID: "Non payé",
    CANCELLED: "Événement annulé",
    REFUNDED: "Billet remboursé",
  };
  return map[result] || result;
}

export function classifyTicketScan(input: {
  ticket: null | { eventId: string; status: string; orderStatus: string };
  eventId: string;
  signatureOk: boolean | null;
}): ScanResultCode {
  if (input.signatureOk === false) return "INVALID";
  if (!input.ticket) return "INVALID";
  if (input.ticket.eventId !== input.eventId) return "WRONG_EVENT";
  if (input.ticket.orderStatus === "REFUNDED" || input.ticket.status === "REFUNDED") return "REFUNDED";
  if (input.ticket.status === "CANCELLED") return "CANCELLED";
  if (input.ticket.orderStatus !== "PAID") return "UNPAID";
  if (input.ticket.status === "USED") return "ALREADY_USED";
  if (input.ticket.status !== "VALID") return "INVALID";
  return "OK";
}
