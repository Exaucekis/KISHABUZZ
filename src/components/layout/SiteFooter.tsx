import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";
import { getSettings } from "@/lib/data";

const nav = [
  { href: "/", label: "Accueil" },
  { href: "/a-propos", label: "À propos" },
  { href: "/chroniques", label: "Chroniques" },
  { href: "/publications", label: "Publications" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/evenements", label: "Événements" },
  { href: "/arena-culture", label: "Arena Culture" },
  { href: "/collaborations", label: "Partenaires" },
  { href: "/contact", label: "Contact" },
];

export async function SiteFooter() {
  const settings = await getSettings();
  const socials = [
    { label: "Facebook", href: settings.socialFacebook },
    { label: "Instagram", href: settings.socialInstagram },
    { label: "YouTube", href: settings.socialYoutube },
    { label: "X", href: settings.socialX },
    { label: "TikTok", href: settings.socialTiktok },
  ].filter((s) => s.href);

  return (
    <footer className="border-t border-line bg-ink-2">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-3 md:px-6">
        <div>
          <BrandLogo size="lg" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper-muted">
            {settings.aboutShort || settings.tagline}
          </p>
        </div>
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-paper-muted">
            Navigation
          </p>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-paper-muted transition hover:text-paper">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-paper-muted">
            Newsletter
          </p>
          <p className="mb-4 text-sm text-paper-muted">
            Recevez les chroniques et actualités KISHA BUZZ.
          </p>
          <NewsletterForm source="footer" compact />
          <p className="mt-6 text-lg font-medium">{settings.phone}</p>
          {settings.email ? (
            <a href={`mailto:${settings.email}`} className="mt-2 block text-paper-muted">
              {settings.email}
            </a>
          ) : null}
          {socials.length > 0 ? (
            <div className="mt-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-paper-muted">
                Suivez KISHA BUZZ
              </p>
              <ul className="flex flex-wrap gap-3 text-sm">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ember-text hover:underline"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-paper-muted md:flex-row md:items-center md:justify-between md:px-6">
          <p>
            © {new Date().getFullYear()} {settings.siteTitle}. Tous droits réservés.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/politique-de-confidentialite">Politique de confidentialité</Link>
            <Link href="/mentions-legales">Mentions légales</Link>
            <Link href="/conditions-d-utilisation">Conditions d&apos;utilisation</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
