export const PLACEHOLDER_IMAGE = "/brand/kisha-buzz-logo.png";

const MISSING_LOCAL = /^\/(artists\/|arena\/albums\/invitee-plateau\/)/i;

export function publicImageSrc(src?: string | null, fallback = PLACEHOLDER_IMAGE) {
  const value = String(src || "").trim();
  if (!value || MISSING_LOCAL.test(value)) return fallback;
  return value;
}
