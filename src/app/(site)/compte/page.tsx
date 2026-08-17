import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Shield, Sparkles } from "lucide-react";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { auth } from "@/lib/auth";
import { canAccessAdmin, canManageUsers, roleLabel } from "@/lib/roles";

export const metadata = { title: "Mon compte" };

function userInitials(name: string | null, role: string) {
  const source = name?.trim() || roleLabel(role);
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default async function ComptePage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/compte");

  const staff = canAccessAdmin(session.user.role);
  const superadmin = canManageUsers(session.user.role);
  const initials = userInitials(session.user.name ?? null, session.user.role);

  return (
    <section className="account-page relative min-h-[80vh] overflow-hidden px-4 py-28">
      <div className="account-page-aurora" aria-hidden />

      <div className="relative z-10 mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ember-text">Espace membre</p>
        <h1 className="mt-3 font-display text-4xl uppercase">Mon compte</h1>
        <span className="section-line mt-4" aria-hidden />

        <div className="account-hero mt-8">
          <span className="user-menu-avatar user-menu-avatar--live text-sm" aria-hidden>
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-2xl uppercase">{session.user.name || "Membre"}</p>
            <p className="mt-1 truncate text-sm text-paper-muted">{session.user.email}</p>
            <span
              className={`user-role-badge mt-3 ${
                session.user.role === "SUPERADMIN"
                  ? "user-role-badge--super"
                  : session.user.role === "ADMIN"
                    ? "user-role-badge--admin"
                    : staff
                      ? "user-role-badge--staff"
                      : ""
              }`}
            >
              {roleLabel(session.user.role)}
            </span>
          </div>
        </div>

        {(staff || superadmin) && (
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {staff ? (
              <Link href="/admin" className="account-action-card account-action-card--primary group">
                <LayoutDashboard className="h-5 w-5 shrink-0 text-ember-text" aria-hidden />
                <span>
                  <strong className="block font-semibold text-paper">Tableau de bord</strong>
                  <span className="mt-1 block text-sm text-paper-muted">CMS, contenus, Arena Culture, médias…</span>
                </span>
              </Link>
            ) : null}
            {superadmin ? (
              <Link href="/admin/users" className="account-action-card group">
                <Sparkles className="h-5 w-5 shrink-0 text-ember-text" aria-hidden />
                <span>
                  <strong className="block font-semibold text-paper">Utilisateurs</strong>
                  <span className="mt-1 block text-sm text-paper-muted">Créer des comptes et attribuer les rôles</span>
                </span>
              </Link>
            ) : null}
          </div>
        )}

        <div className="account-card mt-8">
          <div className="flex items-center gap-2 border-b border-line/70 px-6 py-4">
            <Shield className="h-4 w-4 text-ember-text" aria-hidden />
            <h2 className="font-display text-lg uppercase">Informations</h2>
          </div>
          <div className="grid gap-5 p-6 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-paper-muted">Nom</p>
              <p className="mt-1 text-lg font-semibold">{session.user.name || "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-paper-muted">Email</p>
              <p className="mt-1 text-lg font-semibold break-all">{session.user.email}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.14em] text-paper-muted">Rôle</p>
              <p className="mt-1 text-lg font-semibold">{roleLabel(session.user.role)}</p>
            </div>
          </div>
        </div>

        <ChangePasswordForm />

        <div className="account-card mt-6 flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <p className="font-semibold text-paper">Fin de session</p>
            <p className="mt-1 text-sm text-paper-muted">Déconnectez-vous en toute sécurité de cet appareil.</p>
          </div>
          <SignOutButton />
        </div>
      </div>
    </section>
  );
}
