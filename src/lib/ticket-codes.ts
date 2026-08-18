import { createHash, randomBytes } from "node:crypto";
import { format } from "date-fns";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function randomToken(length: number) {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

export function generateOrderNumber(now = new Date(), suffix = randomToken(4)) {
  return `KB-${format(now, "yyyyMMdd")}-${suffix}`;
}

export function generateTransactionId() {
  return `KB${randomToken(18)}`;
}

export function generatePublicCode() {
  return `KB-TCK-${randomToken(8)}`;
}

export function hashTicketSecret(secret: string) {
  return createHash("sha256").update(secret).digest("hex");
}

export function createTicketSecret() {
  const secret = randomBytes(32).toString("hex");
  return { secret, secretHash: hashTicketSecret(secret) };
}

export function isOrderNumber(value: string) {
  return /^KB-\d{8}-[A-Z2-9]{4}$/.test(value);
}

export function isTransactionId(value: string) {
  return /^KB[A-Z2-9]{18}$/.test(value);
}

export function isPublicCode(value: string) {
  return /^KB-TCK-[A-Z2-9]{8}$/.test(value);
}
