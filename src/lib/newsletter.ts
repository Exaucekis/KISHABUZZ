import { randomBytes } from "node:crypto";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

export function normalizeNewsletterEmail(raw: string) {
  return String(raw || "").trim().toLowerCase();
}

export function isNewsletterEmail(raw: string) {
  const email = normalizeNewsletterEmail(raw);
  return email.length <= 160 && EMAIL_RE.test(email);
}

export function createUnsubscribeToken() {
  return randomBytes(24).toString("hex");
}

export function csvEscape(value: string) {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function subscribersToCsv(
  rows: { email: string; status: string; createdAt: Date | string }[]
) {
  const header = "email,statut,inscrit_le";
  const lines = rows.map((row) =>
    [
      csvEscape(row.email),
      csvEscape(row.status),
      csvEscape(new Date(row.createdAt).toISOString()),
    ].join(",")
  );
  return `\uFEFF${[header, ...lines].join("\n")}\n`;
}

export const MAX_CAMPAIGN_RECIPIENTS = 400;

export function parseRecipientList(raw: string) {
  const tokens = String(raw || "")
    .split(/[\s,;]+/)
    .map(normalizeNewsletterEmail)
    .filter(Boolean);
  const unique = [...new Set(tokens)];
  return {
    emails: unique.filter(isNewsletterEmail),
    invalid: unique.filter((token) => !isNewsletterEmail(token)),
  };
}

export function summarizeRecipients(emails: string[], max = 12) {
  if (emails.length <= max) return emails.join(", ");
  return `${emails.slice(0, max).join(", ")}… (+${emails.length - max})`;
}

export function campaignStatusFromCounts(sent: number, failed: number) {
  if (sent === 0 && failed > 0) return "FAILED";
  if (failed > 0) return "PARTIAL";
  return "SENT";
}

export function campaignNoticeCopy(kind: string, subject: string, sent: number, failed: number) {
  const label = kind === "NOTICE" ? "Notification" : "Newsletter";
  const status = campaignStatusFromCounts(sent, failed);
  const title =
    status === "FAILED"
      ? `Échec d’envoi (${label.toLowerCase()})`
      : status === "PARTIAL"
        ? `Envoi partiel (${label.toLowerCase()})`
        : `${label} envoyée`;
  return {
    title,
    body: `« ${subject} » — ${sent} envoyé${sent > 1 ? "s" : ""}, ${failed} échec${failed > 1 ? "s" : ""}.`,
  };
}
