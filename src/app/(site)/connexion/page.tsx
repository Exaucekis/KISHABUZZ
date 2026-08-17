import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";
import { AuthFooterLink, AuthPageShell } from "@/components/auth/AuthPageShell";

export const metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace membre KISHA BUZZ.",
};

const ASIDE_ITEMS = [
  {
    label: "Contenus & chroniques",
    detail: "Accédez aux publications, portfolios et actualités culturelles.",
  },
  {
    label: "Arena Culture",
    detail: "Suivez les émissions, saisons et couvertures événementielles.",
  },
  {
    label: "Espace pro",
    detail: "Auteurs, éditeurs et admins gèrent le média depuis le tableau de bord.",
  },
] as const;

function LoginWithCallback({ callbackUrl }: { callbackUrl: string }) {
  return <LoginForm callbackUrl={callbackUrl} variant="site" />;
}

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl || "";

  return (
    <AuthPageShell
      eyebrow="Espace membre"
      title="Connexion"
      description="Identifiez-vous pour accéder à votre compte. Votre rôle détermine vos droits : utilisateur, auteur, éditeur, admin ou superadmin."
      asideTitle="KISHA BUZZ"
      asideItems={[...ASIDE_ITEMS]}
      footer={
        <AuthFooterLink prompt="Pas encore de compte ?" href="/inscription" label="Créer un compte" />
      }
    >
      <Suspense fallback={<p className="text-sm text-paper-muted">Chargement…</p>}>
        <LoginWithCallback callbackUrl={callbackUrl} />
      </Suspense>
    </AuthPageShell>
  );
}
