import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PUBLIC_CONTACT_EMAIL } from "@/lib/contact";
import { getPageContent, getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contacter KISHA BUZZ pour une couverture, une interview, un partenariat ou Arena Culture.",
};

export default async function ContactPage() {
  const [settings, intro] = await Promise.all([
    getSettings(),
    getPageContent("contact.intro"),
  ]);

  const phone = settings.phone || "0974105940";
  const email = settings.email || PUBLIC_CONTACT_EMAIL;
  const telHref = `tel:${phone.replace(/\s/g, "")}`;
  const waHref = `https://wa.me/${phone.replace(/\D/g, "")}`;

  return (
    <>
      <section className="border-b border-line bg-ink-2 pt-28 pb-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeading
            eyebrow="Écrire"
            title={intro?.title || "Contact"}
            description={
              intro?.body ||
              "Vous souhaitez collaborer avec KISHA BUZZ, organiser une couverture, participer à une émission ou discuter d'un projet médiatique ?"
            }
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-[1fr_1.2fr] md:px-6 md:py-20">
        <aside className="space-y-8">
          <div className="border border-line bg-ink-2 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-paper-muted">Téléphone</p>
            <a href={telHref} className="mt-3 block font-display text-3xl text-ember-text">
              {phone}
            </a>
            {settings.whatsappEnabled ? (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-sm text-paper-muted hover:text-paper"
              >
                Écrire sur WhatsApp →
              </a>
            ) : null}
          </div>

          <div className="border border-line bg-ink-2 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-paper-muted">Email</p>
            <a href={`mailto:${email}`} className="mt-3 block text-lg">
              {email}
            </a>
          </div>

          {settings.address ? (
            <div className="border border-line bg-ink-2 p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-paper-muted">Adresse</p>
              <p className="mt-3 text-paper-muted whitespace-pre-line">{settings.address}</p>
            </div>
          ) : null}

          <div className="border border-line bg-ink-2 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-paper-muted">Newsletter</p>
            <p className="mt-3 text-sm text-paper-muted">
              Chroniques et actualités, directement dans votre boîte mail.
            </p>
            <div className="mt-5">
              <NewsletterForm source="contact" compact />
            </div>
          </div>
        </aside>

        <div className="border border-line bg-ink-2 p-6 md:p-8">
          <h2 className="font-display text-2xl md:text-3xl">Envoyer une demande</h2>
          <p className="mt-2 text-sm text-paper-muted">
            Tous les champs marqués * sont obligatoires.
          </p>
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
