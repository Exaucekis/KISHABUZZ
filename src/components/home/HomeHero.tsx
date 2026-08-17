import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";

export function HomeHero({ tagline }: { tagline: string }) {
  return (
    <section className="hero-stage hero-stage--lite relative min-h-[100svh] overflow-hidden bg-ink text-paper">
      <div className="hero-aurora" aria-hidden />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col justify-center px-4 pb-24 pt-24 sm:px-6 md:pb-20">
        <div className="flex w-full flex-col items-center text-center">
          <div className="hero-logo-wrap">
            <div className="hero-logo-ring" aria-hidden />
            <div className="hero-logo-spin">
              <BrandLogo href={null} size="hero" priority />
            </div>
          </div>

          <h1 className="hero-title mt-6 w-full max-w-5xl break-words font-display text-[clamp(1.55rem,6vw,4.5rem)] font-extrabold uppercase leading-[1.02] tracking-[-0.03em] text-paper sm:mt-8">
            <span className="hero-title-line">La révolution</span>
            <span className="hero-title-line hero-title-accent">culturelle</span>
            <span className="hero-title-line">&amp; marketing</span>
          </h1>

          <p className="hero-copy mx-auto mt-5 max-w-xl px-1 text-sm leading-relaxed text-paper-muted sm:mt-6 sm:text-base md:text-lg">
            {tagline ||
              "Média, culture et contenus qui donnent une voix aux histoires, aux talents et aux événements."}
          </p>

          <div className="hero-cta mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
            <Link
              href="/a-propos"
              className="btn-interactive btn-pulse inline-flex w-full items-center justify-center rounded-md bg-ember px-5 py-3.5 text-center text-xs font-bold uppercase tracking-wide text-on-ember sm:w-auto sm:text-sm"
            >
              Découvrir KISHA BUZZ
            </Link>
            <Link
              href="/arena-culture"
              className="btn-interactive inline-flex w-full items-center justify-center gap-2 rounded-md border-2 border-line bg-ink-2/70 px-5 py-3.5 text-center text-xs font-bold uppercase tracking-wide text-paper sm:w-auto sm:text-sm"
            >
              Arena Culture
            </Link>
          </div>
        </div>

        <a
          href="#actualites"
          className="hero-scroll absolute bottom-5 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-paper-muted"
        >
          Scroll
          <span className="hero-scroll-line" aria-hidden />
        </a>
      </div>
    </section>
  );
}
