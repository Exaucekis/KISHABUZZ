import Link from "next/link";
import { redirect } from "next/navigation";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";
import { signOutAction } from "@/actions/auth";
import { auth } from "@/lib/auth";
import { canAccessAdmin, roleLabel } from "@/lib/roles";

export const metadata = { title: "Mon compte" };

export default async function ComptePage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/compte");

  const staff = canAccessAdmin(session.user.role);

  return (
    <section className="mx-auto max-w-3xl px-4 py-28">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ember-text">Espace membre</p>
      <h1 className="mt-3 font-display text-4xl uppercase">Mon compte</h1>
      <div className="mt-10 space-y-4 border border-line bg-ink-2 p-6">
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
      <div className="mt-8 flex flex-wrap gap-3">
        {staff ? (
          <Link
            href="/admin"
            className="inline-flex rounded-md bg-ember px-5 py-3 text-sm font-bold uppercase tracking-wide text-on-ember"
          >
            Tableau de bord
          </Link>
        ) : null}
        <form action={signOutAction}>
          <button
            type="submit"
            className="inline-flex rounded-md border border-line px-5 py-3 text-sm font-bold uppercase tracking-wide"
          >
            Déconnexion
          </button>
        </form>
      </div>
    </section>
  );
}
