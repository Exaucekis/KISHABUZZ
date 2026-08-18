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
