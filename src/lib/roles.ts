export const ROLES = ["SUPERADMIN", "ADMIN", "EDITOR", "AUTHOR", "USER"] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  SUPERADMIN: "Superadmin",
  ADMIN: "Admin",
  EDITOR: "Éditeur",
  AUTHOR: "Auteur",
  USER: "Utilisateur",
};

export function isRole(value: string | null | undefined): value is Role {
  return !!value && (ROLES as readonly string[]).includes(value);
}

export function asRole(value: string | null | undefined): Role {
  return isRole(value) ? value : "USER";
}

export function roleLabel(value: string | null | undefined) {
  return ROLE_LABELS[asRole(value)];
}

export function isStaff(value: string | null | undefined) {
  const role = asRole(value);
  return role === "SUPERADMIN" || role === "ADMIN" || role === "EDITOR" || role === "AUTHOR";
}

export function isSuperAdmin(value: string | null | undefined) {
  return asRole(value) === "SUPERADMIN";
}

export function canAccessAdmin(value: string | null | undefined) {
  return isStaff(value);
}

export function canManageUsers(value: string | null | undefined) {
  return isSuperAdmin(value);
}

export function postLoginPath(role: string | null | undefined, callbackUrl?: string | null) {
  const next = callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : null;
  if (next?.startsWith("/admin")) {
    return canAccessAdmin(role) ? next : "/compte";
  }
  if (next) return next;
  return "/compte";
}
