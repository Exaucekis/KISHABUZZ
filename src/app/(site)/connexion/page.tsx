import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = {
  title: "Connexion",
};

function LoginWithCallback({ callbackUrl }: { callbackUrl: string }) {
  return <LoginForm callbackUrl={callbackUrl} />;
}

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl || "";

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4 py-28">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ember-text">Espace membre</p>
      <h1 className="mt-3 font-display text-4xl uppercase">Connexion</h1>
      <p className="mt-3 text-sm text-paper-muted">
        Le compte détermine vos droits : utilisateur, auteur, éditeur, admin ou superadmin.
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-sm text-paper-muted">Chargement…</p>}>
          <LoginWithCallback callbackUrl={callbackUrl} />
        </Suspense>
      </div>
      <p className="mt-6 text-sm text-paper-muted">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-semibold text-ember-text">
          Créer un compte
        </Link>
      </p>
    </section>
  );
}
