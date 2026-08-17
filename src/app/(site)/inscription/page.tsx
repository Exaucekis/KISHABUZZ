import { RegisterForm } from "@/components/auth/RegisterForm";
import { AuthFooterLink, AuthPageShell } from "@/components/auth/AuthPageShell";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { postLoginPath } from "@/lib/roles";

export const metadata = {
  title: "Créer un compte",
  description: "Créez votre compte membre KISHA BUZZ.",
};

const ASIDE_ITEMS = [
  {
    label: "Compte utilisateur",
    detail: "Accédez aux contenus, publications et à votre espace personnel.",
  },
  {
    label: "Évolution des droits",
    detail: "Un superadmin peut vous nommer auteur, éditeur ou administrateur.",
  },
  {
    label: "Rejoindre le média",
    detail: "Participez à la couverture culturelle et aux projets KISHA BUZZ.",
  },
] as const;

export default async function InscriptionPage() {
  const session = await auth();
  if (session?.user) {
    redirect(postLoginPath(session.user.role));
  }

  return (
    <AuthPageShell
      eyebrow="Espace membre"
      title="Inscription"
      description="Créez votre compte en quelques secondes. Chaque nouvelle inscription démarre en tant qu'utilisateur — les rôles avancés sont attribués par un superadmin."
      asideTitle="Rejoindre"
      asideItems={[...ASIDE_ITEMS]}
      footer={<AuthFooterLink prompt="Déjà inscrit ?" href="/connexion" label="Se connecter" />}
    >
      <RegisterForm />
    </AuthPageShell>
  );
}
