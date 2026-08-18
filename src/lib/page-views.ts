export type ViewKind = "article" | "show";

export const VIEW_TTL_MS = 6 * 60 * 60 * 1000;

export function formatViews(count: number) {
  const n = Math.max(0, Math.floor(Number(count) || 0));
  const formatted = n.toLocaleString("fr-FR");
  return n <= 1 ? `${formatted} vue` : `${formatted} vues`;
}

export function isBotUserAgent(ua?: string | null) {
  if (!ua) return false;
  return /bot|crawl|spider|slurp|facebookexternalhit|preview|lighthouse|headless|wget|curl/i.test(
    ua
  );
}

export function viewStorageKey(kind: ViewKind, id: string) {
  return `kb-view:${kind}:${id}`;
}

export function hasRecentView(kind: ViewKind, id: string) {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(viewStorageKey(kind, id));
    if (!raw) return false;
    const at = Number(raw);
    return Number.isFinite(at) && Date.now() - at < VIEW_TTL_MS;
  } catch {
    return false;
  }
}

export function markView(kind: ViewKind, id: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(viewStorageKey(kind, id), String(Date.now()));
  } catch {
    // private mode
  }
}
