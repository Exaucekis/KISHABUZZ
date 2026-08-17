import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { cn } from "@/lib/utils";

type AsideItem = {
  label: string;
  detail: string;
};

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  asideTitle: string;
  asideItems: AsideItem[];
  footer: ReactNode;
  children: ReactNode;
  className?: string;
};

export function AuthPageShell({
  eyebrow,
  title,
  description,
  asideTitle,
  asideItems,
  footer,
  children,
  className,
}: Props) {
  return (
    <section className={cn("auth-stage hero-stage hero-stage--lite relative min-h-[100svh] overflow-hidden", className)}>
      <div className="hero-aurora" aria-hidden />
      <div className="hero-grid opacity-40" aria-hidden />
      <div className="hero-orb hero-orb-a opacity-70" aria-hidden />
      <div className="hero-orb hero-orb-b opacity-60" aria-hidden />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col justify-center px-4 py-28 md:px-6 lg:py-32">
        <div className="grid items-stretch gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10">
          <aside className="auth-aside order-2 flex flex-col justify-center lg:order-1">
            <div className="auth-aside-inner">
              <BrandLogo href="/" size="lg" className="auth-aside-logo" />

              <p className="mt-8 text-xs font-semibold uppercase tracking-[0.28em] text-ember-text">
                {asideTitle}
              </p>
              <h2 className="auth-aside-headline mt-4 font-display text-3xl uppercase leading-[1.05] md:text-4xl">
                La révolution
                <span className="block text-ember-text">culturelle</span>
                &amp; marketing
              </h2>
              <span className="section-line mt-5" aria-hidden />

              <ul className="auth-feature-list mt-8 space-y-3">
                {asideItems.map((item) => (
                  <li key={item.label} className="auth-feature-item">
                    <span className="auth-feature-dot" aria-hidden />
                    <span>
                      <strong className="block text-sm font-semibold text-paper">{item.label}</strong>
                      <span className="mt-0.5 block text-sm leading-relaxed text-paper-muted">{item.detail}</span>
                    </span>
                  </li>
                ))}
              </ul>

              <p className="auth-aside-foot mt-10 text-sm leading-relaxed text-paper-muted">
                Rejoignez l&apos;écosystème KISHA BUZZ — chroniques, productions, Arena Culture et espace pro.
              </p>
            </div>
          </aside>

          <div className="auth-panel order-1 lg:order-2">
            <div className="mb-6 flex justify-center lg:hidden">
              <BrandLogo href="/" size="md" />
            </div>
            <div className="auth-card">
              <div className="auth-card-glow" aria-hidden />

              <div className="auth-card-head">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ember-text">{eyebrow}</p>
                <h1 className="mt-3 font-display text-3xl uppercase leading-tight md:text-4xl">{title}</h1>
                <span className="section-line mt-4" aria-hidden />
                <p className="mt-4 text-sm leading-relaxed text-paper-muted md:text-base">{description}</p>
              </div>

              <div className="auth-card-body">{children}</div>

              <div className="auth-card-foot">{footer}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AuthFooterLink({
  prompt,
  href,
  label,
}: {
  prompt: string;
  href: string;
  label: string;
}) {
  return (
    <p className="text-center text-sm text-paper-muted">
      {prompt}{" "}
      <Link href={href} className="font-semibold text-ember-text transition hover:text-paper">
        {label}
      </Link>
    </p>
  );
}
