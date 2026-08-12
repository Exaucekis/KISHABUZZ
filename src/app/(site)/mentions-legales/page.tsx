import type { Metadata } from "next";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site KISHA BUZZ.",
};

export default async function MentionsLegalesPage() {
  const settings = await getSettings();

  return (
    <LegalShell title="Mentions légales">
      <p>
        Le site <strong>{settings.siteTitle}</strong> est édité dans le cadre de l&apos;activité
        médiatique et professionnelle KISHA BUZZ.
      </p>
      <h2>Éditeur</h2>
      <p>
        Raison sociale / identité : KISHA BUZZ
        <br />
        Téléphone : {settings.phone || "0974105940"}
        {settings.email ? (
          <>
            <br />
            Email : {settings.email}
          </>
        ) : null}
        {settings.address ? (
          <>
            <br />
            Adresse : {settings.address}
          </>
        ) : null}
      </p>
      <h2>Hébergement</h2>
      <p>
        Les informations d&apos;hébergement seront complétées selon l&apos;infrastructure de
        production utilisée.
      </p>
      <h2>Propriété intellectuelle</h2>
      <p>
        Les contenus publiés sur ce site (textes, images, vidéos, marques) restent protégés. Toute
        reproduction non autorisée est interdite, sauf usage légalement autorisé.
      </p>
      <h2>Contact</h2>
      <p>
        Pour toute question relative aux mentions légales :{" "}
        <a href="/contact" className="text-ember-text">
          page contact
        </a>
        .
      </p>
    </LegalShell>
  );
}

function LegalShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <section className="border-b border-line bg-ink-2 pt-28 pb-12">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <h1 className="font-display text-4xl md:text-5xl">{title}</h1>
        </div>
      </section>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-12 text-base leading-relaxed text-paper-muted md:px-6 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-paper [&_strong]:text-paper">
        {children}
      </div>
    </>
  );
}
