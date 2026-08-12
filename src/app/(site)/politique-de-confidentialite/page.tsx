import type { Metadata } from "next";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité et traitement des données — KISHA BUZZ.",
};

export default async function PolitiqueConfidentialitePage() {
  const settings = await getSettings();

  return (
    <>
      <section className="border-b border-line bg-ink-2 pt-28 pb-12">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <h1 className="font-display text-4xl md:text-5xl">Politique de confidentialité</h1>
        </div>
      </section>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-12 text-base leading-relaxed text-paper-muted md:px-6 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-paper">
        <p>
          Cette politique décrit la manière dont {settings.siteTitle} traite les données
          personnelles collectées via le site, notamment le formulaire de contact.
        </p>
        <h2>Données collectées</h2>
        <p>
          Lors d&apos;une demande de contact, nous pouvons collecter : nom, organisation,
          téléphone, email, sujet, type de collaboration et message. Ces informations sont
          utilisées uniquement pour répondre à votre demande.
        </p>
        <h2>Finalités</h2>
        <p>
          Traitement des demandes de collaboration, suivi commercial ou éditorial, et amélioration
          du service. Aucune donnée n&apos;est revendue.
        </p>
        <h2>Conservation</h2>
        <p>
          Les demandes sont conservées le temps nécessaire au traitement, puis archivées ou
          supprimées selon les besoins opérationnels.
        </p>
        <h2>Vos droits</h2>
        <p>
          Vous pouvez demander l&apos;accès, la rectification ou la suppression de vos données en
          nous contactant via la{" "}
          <a href="/contact" className="text-ember-text">
            page contact
          </a>
          {settings.email ? (
            <>
              {" "}
              ou à <a href={`mailto:${settings.email}`}>{settings.email}</a>
            </>
          ) : null}
          .
        </p>
        <h2>Cookies</h2>
        <p>
          Le site peut utiliser des cookies techniques nécessaires au fonctionnement. Aucun
          tracking publicitaire n&apos;est activé par défaut.
        </p>
      </div>
    </>
  );
}
