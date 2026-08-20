import { calendarDayKey, isPaidSession } from "@/lib/event-schedule";
import { eventPlace, totalRemaining } from "@/lib/events";

export type ArenaCalendarEvent = {
  slug: string;
  status: string;
  venueName: string;
  city: string;
  address: string;
  sessions: { access: string; startsAt: Date; endsAt: Date | null }[];
  ticketTypes: { quantity: number; soldCount: number; reservedCount: number; visible?: boolean }[];
};

export type ArenaTicketCta = {
  href: string;
  label: string;
  kind: "paid" | "free" | "soldout";
};

export function isUpcomingArenaDate(
  show: { airDate: Date | null; status: string },
  now = new Date()
) {
  if (show.status !== "SCHEDULED" && show.status !== "PUBLISHED") return false;
  if (!show.airDate) return show.status === "SCHEDULED";
  return calendarDayKey(show.airDate) >= calendarDayKey(now);
}

export function compareArenaDates(
  a: { airDate: Date | null; number: number },
  b: { airDate: Date | null; number: number }
) {
  if (!a.airDate && !b.airDate) return a.number - b.number;
  if (!a.airDate) return 1;
  if (!b.airDate) return -1;
  const byDay = calendarDayKey(a.airDate).localeCompare(calendarDayKey(b.airDate));
  if (byDay) return byDay;
  return a.number - b.number;
}

export function arenaShowPlace(
  show: { venueName?: string | null },
  event?: { venueName?: string; city?: string; address?: string } | null
) {
  const own = String(show.venueName || "").trim();
  if (own) return own;
  if (event) return eventPlace(event) || "";
  return "";
}

export function arenaTicketCta(event: ArenaCalendarEvent | null | undefined): ArenaTicketCta | null {
  if (!event) return null;
  if (event.status === "DRAFT" || event.status === "CANCELLED" || event.status === "ENDED") return null;
  const href = `/evenements/${event.slug}`;
  const visibleTypes = event.ticketTypes.filter((type) => type.visible !== false);
  if (event.status === "SOLD_OUT") {
    return { href, label: "Complet", kind: "soldout" };
  }
  if (visibleTypes.length && totalRemaining(visibleTypes) <= 0) {
    return { href, label: "Complet", kind: "soldout" };
  }
  if (event.sessions.some((session) => isPaidSession(session))) {
    return { href, label: "Prendre un billet", kind: "paid" };
  }
  return { href, label: "Entrée libre", kind: "free" };
}
