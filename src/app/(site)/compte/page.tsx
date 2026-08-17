import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, LogOut } from "lucide-react";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";
import { signOutAction } from "@/actions/auth";
import { auth } from "@/lib/auth";
import { canAccessAdmin, canManageUsers, roleLabel } from "@/lib/roles";

export const metadata = { title: "Mon compte" };

export default async function ComptePage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/compte");

  const staff = canAccessAdmin(session.user.role);
  const superadmin = canManageUsers(session.user.role);

  return (
    <section className="mx-auto max-w-3xl px-4 py-28">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ember-text">Espace membre</p>
      <h1 className="mt-3 font-display text-4xl uppercase">Mon compte</h1>
      <p className="mt-3 text-sm text-paper-muted">
        Gérez vos informations personnelles et votre mot de passe.
      </p>

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {staff ? (
          <Link
            href="/admin"
            className="account-action-card account-action-card--primary group"
          >
            <LayoutDashboard className="h-5 w-5 text-ember-text" aria-hidden />
            <span>
              <strong className="block font-semibold text-paper">Tableau de bord</strong>
              <span className="mt-1 block text-sm text-paper-muted">
                CMS, contenus, Arena Culture, médias…
              </span>
            </span>
          </Link>
        ) : null}
        {superadmin ? (
          <Link href="/admin/users" className="account-action-card group">
            <span className="flex h-5 w-5 items-center justify-center text-xs font-bold text-ember-text">U</span>
            <span>
              <strong className="block font-semibold text-paper">Utilisateurs</strong>
              <span className="mt-1 block text-sm text-paper-muted">
                Créer des comptes et attribuer les rôles
              </span>
            </span>
          </Link>
        ) : null}
      </div>

      <div className="mt-8 space-y-4 border border-line bg-ink-2 p-6">
        <p>
          <span className="text-sm text-paper-muted">Nom</span>
          <br />
          <span className="text-lg font-semibold">{session.user.name || "—"}</span>
        </p>
        <p>
          <span className="text-sm text-paper-muted">Email</span>
          <br />
          <span className="text-lg font-semibold">{session.user.email}</span>
        </p>
        <p>
          <span className="text-sm text-paper-muted">Rôle</span>
          <br />
          <span className="text-lg font-semibold">{roleLabel(session.user.role)}</span>
        </p>
      </div>

      <ChangePasswordForm />

      <div className="mt-8">
        <form action={signOutAction}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-md border border-line px-5 py-3 text-sm font-bold uppercase tracking-wide transition hover:bg-ink-3"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Déconnexion
          </button>
        </form>
      </div>
    </section>
  );
}
