import type { Metadata } from "next";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description: "Conditions générales d'utilisation du site KISHA BUZZ.",
};

export default async function ConditionsUtilisationPage() {
  const settings = await getSettings();

  return (
    <>
      <section className="border-b border-line bg-ink-2 pt-28 pb-12">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <h1 className="font-display text-4xl md:text-5xl">Conditions d&apos;utilisation</h1>
        </div>
      </section>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-12 text-base leading-relaxed text-paper-muted md:px-6 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-paper">
        <p>
          En accédant au site {settings.siteTitle}, vous acceptez les présentes conditions
          d&apos;utilisation.
        </p>
        <h2>Objet du site</h2>
        <p>
          Le site présente l&apos;identité, les contenus éditoriaux, le portfolio médiatique et
          l&apos;univers Arena Culture de KISHA BUZZ.
        </p>
        <h2>Usage autorisé</h2>
        <p>
          Vous pouvez consulter les contenus à titre personnel et informatif. Toute extraction
          massive, republication ou usage commercial non autorisé est interdit.
        </p>
        <h2>Contenus</h2>
        <p>
          Les informations sont fournies de bonne foi. KISHA BUZZ peut mettre à jour, corriger ou
          retirer des contenus à tout moment.
        </p>
        <h2>Liens externes</h2>
        <p>
          Les liens vers des sites tiers (réseaux sociaux, plateformes vidéo) restent sous la
          responsabilité de leurs éditeurs.
        </p>
        <h2>Contact</h2>
        <p>
          Pour toute question :{" "}
          <a href="/contact" className="text-ember-text">
            page contact
          </a>
          .
        </p>
      </div>
    </>
  );
}
