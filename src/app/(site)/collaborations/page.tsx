import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getVisiblePartners } from "@/lib/data";

export const metadata: Metadata = {
  title: "Collaborations & partenaires",
  description: "Partenaires et collaborations officielles de KISHA BUZZ.",
};

export default async function CollaborationsPage() {
  const partners = await getVisiblePartners();

  return (
    <>
      <section className="border-b border-line bg-ink-2 pt-28 pb-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeading
            eyebrow="Réseau"
            title="Collaborations & partenaires"
            description="Les partenaires officiels publiés apparaissent ici. Aucun nom n'est inventé."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        {partners.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((p) => (
              <div key={p.id} className="border border-line bg-ink-2 p-6">
                {p.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.logo}
                    alt=""
                    className="mb-5 h-12 w-auto object-contain"
                    loading="lazy"
                  />
                ) : null}
                <h2 className="font-display text-2xl">{p.name}</h2>
                {p.description ? (
                  <p className="mt-3 text-sm leading-relaxed text-paper-muted">{p.description}</p>
                ) : null}
                {p.project ? (
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-ember-text">
                    {p.project}
                  </p>
                ) : null}
                {p.website ? (
                  <a
                    href={p.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block text-sm text-ember-text hover:underline"
                  >
                    Site web →
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Aucun partenaire publié pour le moment"
            description="Les collaborations officielles seront affichées dès leur validation."
            action={<ButtonLink href="/contact">Proposer une collaboration</ButtonLink>}
          />
        )}
      </section>
    </>
  );
}
