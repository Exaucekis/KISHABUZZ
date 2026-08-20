import { isNewsletterEmail, normalizeNewsletterEmail } from "@/lib/newsletter";

export const PUBLIC_CONTACT_EMAIL = "contact@kisha-buzz.com";

export function resolveContactInbox(siteEmail = "") {
  const fromEnv = normalizeNewsletterEmail(process.env.CONTACT_INBOX || "");
  if (fromEnv && isNewsletterEmail(fromEnv)) return fromEnv;
  const fromSite = normalizeNewsletterEmail(siteEmail);
  if (fromSite && isNewsletterEmail(fromSite)) return fromSite;
  return PUBLIC_CONTACT_EMAIL;
}

export function withPublicContactEmail<T extends { email?: string | null }>(settings: T): T {
  const email = String(settings.email || "").trim();
  return { ...settings, email: email || PUBLIC_CONTACT_EMAIL };
}
