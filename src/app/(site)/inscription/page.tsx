import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Créer un compte",
};

export default function InscriptionPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4 py-28">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ember-text">Espace membre</p>
      <h1 className="mt-3 font-display text-4xl uppercase">Inscription</h1>
      <p className="mt-3 text-sm text-paper-muted">
        Un nouveau compte est un utilisateur. Un superadmin peut ensuite le nommer admin, éditeur ou auteur.
      </p>
      <div className="mt-8">
        <RegisterForm />
      </div>
      <p className="mt-6 text-sm text-paper-muted">
        Déjà inscrit ?{" "}
        <Link href="/connexion" className="font-semibold text-ember-text">
          Se connecter
        </Link>
      </p>
    </section>
  );
}
