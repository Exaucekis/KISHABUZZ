import type { Metadata } from "next";
import {
  getPageContent,
  getSettings,
  getVisibleDomains,
} from "@/lib/data";
import { DomainIcon } from "@/components/content/DomainIcon";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: "À propos",
    description:
      settings.aboutShort ||
      "Identité, parcours, expertise et domaines d'activité de KISHA BUZZ.",
  };
}

export default async function AboutPage() {
  const [settings, qui, parcours, expertise, vision, domains] = await Promise.all([
    getSettings(),
    getPageContent("about.qui"),
    getPageContent("about.parcours"),
    getPageContent("about.expertise"),
    getPageContent("about.vision"),
    getVisibleDomains(),
  ]);

  const sections = [
    { key: "qui", content: qui, fallbackTitle: "Qui sommes-nous ?" },
    { key: "parcours", content: parcours, fallbackTitle: "Parcours" },
    { key: "expertise", content: expertise, fallbackTitle: "Expertise" },
    { key: "vision", content: vision, fallbackTitle: "Vision" },
  ];

  return (
    <>
      <section className="editorial-gradient border-b border-line pt-28 pb-16 md:pb-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-ember-text">
            Identité
          </p>
          <h1 className="font-display text-4xl leading-tight md:text-6xl lg:text-7xl">
            À propos de {settings.siteTitle}
          </h1>
          <p className="mt-5 max-w-2xl font-serif text-lg text-paper-muted md:text-xl">
            {settings.aboutShort || settings.tagline}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-20 px-4 py-16 md:px-6 md:py-24">
        {sections.map((section, i) => (
          <section
            key={section.key}
            className={i % 2 === 1 ? "border-y border-line bg-ink-2 -mx-4 px-4 py-14 md:-mx-6 md:px-6" : ""}
          >
            <SectionHeading
              eyebrow={section.fallbackTitle}
              title={section.content?.title || section.fallbackTitle}
              description={
                section.content?.body ||
                (section.key === "qui"
                  ? settings.aboutLong || settings.aboutShort
                  : "Ce contenu sera publié depuis le back-office.")
              }
            />
          </section>
        ))}

        <section>
          <SectionHeading
            eyebrow="Domaines"
            title="Domaines d'activité"
            description="Les expertises opérationnelles de KISHA BUZZ."
          />
          <div className="mt-10">
            {domains.length ? (
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {domains.map((d) => (
                  <div key={d.id} className="border border-line bg-ink-2 px-5 py-6">
                    <div className="mb-3 flex items-center gap-3">
                      <DomainIcon icon={d.icon} name={d.name} />
                      <h3 className="font-display text-xl">{d.name}</h3>
                    </div>
                    {d.description ? (
                      <p className="mt-2 text-sm leading-relaxed text-paper-muted">
                        {d.description}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="Domaines à venir" description="Les domaines seront listés ici." />
            )}
          </div>
        </section>

        <section className="border border-line bg-gradient-to-br from-ink-3 to-ink p-8 md:p-12">
          <SectionHeading
            eyebrow="Collaboration"
            title="Travailler avec KISHA BUZZ"
            description="Projets médiatiques, couvertures, interviews ou Arena Culture."
          />
          <div className="mt-8">
            <ButtonLink href="/contact">Nous contacter</ButtonLink>
          </div>
        </section>
      </div>
    </>
  );
}
