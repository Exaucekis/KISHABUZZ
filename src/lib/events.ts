import { formatDate } from "@/lib/utils";
import { boxOfficeClosesAt, paidSessions, type ScheduleSession } from "@/lib/event-schedule";

export const EVENT_STATUSES = ["DRAFT", "PUBLISHED", "SOLD_OUT", "ENDED", "CANCELLED"] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const RESERVATION_MINUTES = 10;

export type TicketStock = {
  quantity: number;
  soldCount: number;
  reservedCount: number;
};

export function remainingSeats(type: TicketStock) {
  return Math.max(0, type.quantity - type.soldCount - type.reservedCount);
}

export type ReservationConvertMode = "reserved" | "stock" | "failed";

export function convertReservationOutcome(
  reservedCount: number,
  remaining: number,
  quantity: number
): ReservationConvertMode {
  if (quantity <= 0) return "failed";
  if (reservedCount >= quantity) return "reserved";
  if (remaining >= quantity) return "stock";
  return "failed";
}

export function totalRemaining(types: TicketStock[]) {
  return types.reduce((sum, type) => sum + remainingSeats(type), 0);
}

export function isCinetPayAmount(amount: number) {
  return Number.isInteger(amount) && amount >= 0 && amount % 5 === 0;
}

export function formatMoney(amount: number, currency = "CDF") {
  const digits = Math.trunc(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${digits} ${currency}`;
}

export function lowestVisiblePrice(types: { price: number; visible?: boolean }[]) {
  const prices = types.filter((type) => type.visible !== false).map((type) => type.price);
  if (!prices.length) return null;
  return Math.min(...prices);
}

export function eventStatusLabel(status: string) {
  const map: Record<string, string> = {
    DRAFT: "Brouillon",
    PUBLISHED: "Publié",
    SOLD_OUT: "Complet",
    ENDED: "Terminé",
    CANCELLED: "Annulé",
  };
  return map[status] || status;
}

export function eventPlace(event: { venueName?: string; city?: string; address?: string }) {
  return [event.venueName, event.city || event.address].filter(Boolean).join(" · ");
}

function sameCalendarDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatEventWhen(startsAt: Date, endsAt?: Date | null) {
  const start = formatDate(startsAt, "EEEE d MMMM yyyy · HH:mm");
  if (!endsAt) return start;
  if (sameCalendarDay(startsAt, endsAt)) {
    return `${start} — ${formatDate(endsAt, "HH:mm")}`;
  }
  return `${start} → ${formatDate(endsAt, "EEEE d MMMM yyyy · HH:mm")}`;
}

export function eventOnSale(
  event: {
    status: string;
    salesOpensAt?: Date | null;
    salesClosesAt?: Date | null;
    startsAt: Date;
    endsAt?: Date | null;
    sessions?: ScheduleSession[];
  },
  now = new Date()
) {
  if (event.status !== "PUBLISHED") return false;
  if (event.salesOpensAt && event.salesOpensAt > now) return false;
  if (boxOfficeClosesAt(event) < now) return false;
  if (event.sessions?.length && !paidSessions(event.sessions).length) return false;
  return true;
}

export function ticketTypeOnSale(
  type: {
    visible?: boolean;
    salesOpensAt?: Date | null;
    salesClosesAt?: Date | null;
  },
  now = new Date()
) {
  if (type.visible === false) return false;
  if (type.salesOpensAt && type.salesOpensAt > now) return false;
  if (type.salesClosesAt && type.salesClosesAt < now) return false;
  return true;
}

export const ORDER_STATUSES = [
  "PENDING",
  "AWAITING_PAYMENT",
  "PAID",
  "FAILED",
  "EXPIRED",
  "CANCELLED",
  "REFUNDED",
] as const;

export function orderStatusLabel(status: string) {
  const map: Record<string, string> = {
    PENDING: "En préparation",
    AWAITING_PAYMENT: "Paiement en cours",
    PAID: "Payée",
    FAILED: "Échec",
    EXPIRED: "Expirée",
    CANCELLED: "Annulée",
    REFUNDED: "Remboursée",
  };
  return map[status] || status;
}

export function ticketStatusLabel(status: string) {
  const map: Record<string, string> = {
    VALID: "Valide",
    USED: "Utilisé",
    CANCELLED: "Annulé",
    REFUNDED: "Remboursé",
  };
  return map[status] || status;
}
