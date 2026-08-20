import { formatDate } from "@/lib/utils";

export const EVENT_TZ = "Africa/Lubumbashi";
export const SESSION_ACCESS = ["PAID", "FREE"] as const;
export type SessionAccess = (typeof SESSION_ACCESS)[number];

export type ScheduleSession = {
  id?: string;
  startsAt: Date;
  endsAt?: Date | null;
  access?: string | null;
  label?: string | null;
};

export function calendarDayKey(date: Date, timeZone = EVENT_TZ) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function sessionEnd(session: { startsAt: Date; endsAt?: Date | null }) {
  return session.endsAt && session.endsAt > session.startsAt ? session.endsAt : session.startsAt;
}

export function isPaidSession(session: { access?: string | null }) {
  return session.access !== "FREE";
}

export function paidSessions<T extends { access?: string | null }>(sessions: T[]) {
  return sessions.filter(isPaidSession);
}

export function deriveEventBounds(sessions: { startsAt: Date; endsAt?: Date | null }[]) {
  if (!sessions.length) return null;
  const starts = sessions.map((session) => session.startsAt.getTime());
  const ends = sessions.map((session) => sessionEnd(session).getTime());
  return {
    startsAt: new Date(Math.min(...starts)),
    endsAt: new Date(Math.max(...ends)),
  };
}

export function sessionsForTicketType<T extends ScheduleSession>(
  sessions: T[],
  selectedIds: string[] | null | undefined
) {
  const paid = paidSessions(sessions);
  if (!selectedIds?.length) return paid;
  const wanted = new Set(selectedIds);
  const matched = paid.filter((session) => session.id && wanted.has(session.id));
  return matched.length ? matched : paid;
}

export function boxOfficeClosesAt(event: {
  salesClosesAt?: Date | null;
  startsAt: Date;
  endsAt?: Date | null;
  sessions?: ScheduleSession[];
}) {
  if (event.salesClosesAt) return event.salesClosesAt;
  const paid = paidSessions(event.sessions || []);
  if (paid.length) {
    return new Date(Math.max(...paid.map((session) => sessionEnd(session).getTime())));
  }
  return event.endsAt && event.endsAt > event.startsAt ? event.endsAt : event.startsAt;
}

export function ticketTypeHasLiveDay(
  sessions: ScheduleSession[],
  selectedIds: string[] | null | undefined,
  now = new Date()
) {
  return sessionsForTicketType(sessions, selectedIds).some((session) => sessionEnd(session) >= now);
}

export function ticketTypeCoversToday(
  sessions: ScheduleSession[],
  selectedIds: string[] | null | undefined,
  now = new Date()
) {
  const today = calendarDayKey(now);
  return sessionsForTicketType(sessions, selectedIds).some(
    (session) => calendarDayKey(session.startsAt) === today
  );
}

export function sessionOnDay(sessions: ScheduleSession[], now = new Date()) {
  const today = calendarDayKey(now);
  return sessions.find((session) => calendarDayKey(session.startsAt) === today) || null;
}

export function laterPaidSessionsRemain(
  sessions: ScheduleSession[],
  selectedIds: string[] | null | undefined,
  now = new Date()
) {
  const today = calendarDayKey(now);
  return sessionsForTicketType(sessions, selectedIds).some(
    (session) => calendarDayKey(session.startsAt) > today
  );
}

export function formatSessionLine(session: ScheduleSession) {
  const when = formatDate(session.startsAt, "EEEE d MMMM yyyy · HH:mm");
  const access = isPaidSession(session) ? "Payant" : "Entrée libre";
  return session.label ? `${session.label} · ${when} · ${access}` : `${when} · ${access}`;
}

export function formatSessionsSummary(
  sessions: ScheduleSession[],
  fallbackStart: Date,
  _fallbackEnd?: Date | null
) {
  if (!sessions.length) {
    return formatDate(fallbackStart, "EEEE d MMMM yyyy · HH:mm");
  }
  if (sessions.length === 1) {
    return formatSessionLine(sessions[0]).replace(/ · (Payant|Entrée libre)$/, "");
  }
  return sessions.map((session) => formatDate(session.startsAt, "EEE d MMM")).join(" · ");
}

export function formatTicketValidity(sessions: ScheduleSession[]) {
  if (!sessions.length) return "";
  if (sessions.length === 1) {
    return `Valable ${formatDate(sessions[0].startsAt, "EEEE d MMMM yyyy")}`;
  }
  return `Valable : ${sessions.map((session) => formatDate(session.startsAt, "EEE d MMM")).join(", ")}`;
}
