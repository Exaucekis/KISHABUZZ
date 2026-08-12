import { auth } from "@/lib/auth";

export type AdminActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
  id?: string;
};

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Non autorisé");
  }
  return session;
}

export function formString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export function formBool(formData: FormData, key: string) {
  const v = formData.get(key);
  return v === "on" || v === "true" || v === "1";
}

export function formOptionalId(formData: FormData, key: string) {
  const v = formString(formData, key);
  return v || null;
}

export function formInt(formData: FormData, key: string, fallback = 0) {
  const n = Number.parseInt(formString(formData, key), 10);
  return Number.isFinite(n) ? n : fallback;
}

export function formDate(formData: FormData, key: string) {
  const raw = formString(formData, key);
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}
