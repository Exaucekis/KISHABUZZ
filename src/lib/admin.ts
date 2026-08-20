import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canAccessAdmin, canManageUsers } from "@/lib/roles";

export type AdminActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
  id?: string;
};

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/connexion");
  }
  if (!canAccessAdmin(session.user.role)) {
    redirect("/compte");
  }
  return session;
}

export async function requireSuperAdmin() {
  const session = await requireAdmin();
  if (!canManageUsers(session.user.role)) {
    redirect("/admin");
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

export function formDateTime(
  formData: FormData,
  dateKey: string,
  timeKey: string,
  fallbackTime = "00:00"
) {
  const date = formString(formData, dateKey);
  if (!date) return null;
  const time = formString(formData, timeKey) || fallbackTime;
  const d = new Date(`${date}T${time}`);
  return Number.isNaN(d.getTime()) ? null : d;
}
