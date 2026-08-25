import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";
import { getSettings } from "@/lib/data";
import { SITE_NAV_WITH_ARENA } from "@/lib/site-structure";

const nav = SITE_NAV_WITH_ARENA;

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
    <footer className="border-t border-line/60 bg-[#06080d] text-paper-muted">
      <div className="mx-auto max-w-5xl px-4 py-8 text-center sm:px-6 sm:py-10">
        {/* Logo & Description centrés */}
        <div className="flex flex-col items-center justify-center">
          <BrandLogo size="md" />
          <p className="mt-2.5 max-w-xl text-xs sm:text-sm text-paper-muted leading-relaxed">
            {settings.aboutShort || settings.tagline || "La révolution culturelle et marketing."}
          </p>
        </div>

        {/* Navigation principale horizontale centrée */}
        <nav className="my-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-y border-line/40 py-3 text-xs sm:text-sm font-semibold" aria-label="Navigation secondaire">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-paper hover:underline underline-offset-4"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Section Newsletter Compacte & Centrée */}
        <div className="mx-auto max-w-md">
          <p className="mb-2 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-paper/80">
            Newsletter KISHA BUZZ
          </p>
          <NewsletterForm source="footer" compact allowWhatsApp />
        </div>

        {/* Coordonnées & Réseaux sociaux centrés */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-paper-muted">
          {settings.phone ? (
            <div className="flex items-center gap-1.5 font-medium text-paper">
              <Phone className="h-3.5 w-3.5 text-ember-text" />
              <span>{settings.phone}</span>
            </div>
          ) : null}

          {settings.email ? (
            <a
              href={`mailto:${settings.email}`}
              className="flex items-center gap-1.5 hover:text-paper hover:underline"
            >
              <Mail className="h-3.5 w-3.5 text-ember-text" />
              <span>{settings.email}</span>
            </a>
          ) : null}

          {socials.length > 0 ? (
            <div className="flex items-center gap-3">
              <span className="text-white/40">·</span>
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-ember-text hover:underline"
                >
                  {s.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>

        {/* Bas de footer : Copyright & Liens légaux centrés */}
        <div className="mt-8 border-t border-line/30 pt-4 flex flex-col items-center justify-center gap-2 text-[0.72rem] text-paper-muted sm:flex-row sm:gap-6">
          <p>
            © {new Date().getFullYear()} {settings.siteTitle}. Tous droits réservés.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/politique-de-confidentialite" className="hover:text-paper hover:underline">
              Politique de confidentialité
            </Link>
            <Link href="/mentions-legales" className="hover:text-paper hover:underline">
              Mentions légales
            </Link>
            <Link href="/conditions-d-utilisation" className="hover:text-paper hover:underline">
              Conditions d&apos;utilisation
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
