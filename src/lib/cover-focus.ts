export type CoverFocus = { x: number; y: number };

export function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 50;
  return Math.min(100, Math.max(0, value));
}

export function parseCoverFocus(raw?: string | null): CoverFocus {
  const match = String(raw || "").match(/(-?\d+(?:\.\d+)?)\s*%?[,\s]+(-?\d+(?:\.\d+)?)\s*%?/);
  if (!match) return { x: 50, y: 50 };
  return { x: clampPercent(Number(match[1])), y: clampPercent(Number(match[2])) };
}

export function formatCoverFocus(x: number, y: number) {
  return `${Math.round(clampPercent(x))}% ${Math.round(clampPercent(y))}%`;
}

export function coverFocusStyle(raw?: string | null): { objectPosition: string } {
  return { objectPosition: normalizeCoverFocus(raw) };
}

export function normalizeCoverFocus(raw?: string | null) {
  const { x, y } = parseCoverFocus(raw);
  return formatCoverFocus(x, y);
}
