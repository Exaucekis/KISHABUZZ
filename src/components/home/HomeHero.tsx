import Link from "next/link";
import { ArrowRight, Mic2, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { isDirectVideo, parseMediaEmbed, youtubeBackgroundSrc } from "@/lib/media";

export function HomeHero({
  tagline,
  heroImage,
  heroVideo,
  heroAlt,
}: {
  tagline: string;
  heroImage?: string;
  heroVideo?: string;
  heroAlt?: string;
}) {
  const embed = heroVideo ? parseMediaEmbed(heroVideo) : null;
  const fileVideo = Boolean(heroVideo && isDirectVideo(heroVideo));
  const youtubeBg = embed?.provider === "youtube";
  const vimeoBg = embed?.provider === "vimeo";
  const imageBg = Boolean(heroImage && !fileVideo && !youtubeBg && !vimeoBg);
  const hasMedia = fileVideo || youtubeBg || vimeoBg || imageBg;

  return (
    <section className="hero-stage hero-stage--lite relative min-h-[100svh] overflow-hidden bg-ink text-paper">
      {/* ─── Fond vert sombre & aurore lumineuse ─── */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_80%_60%_at_50%_20%,rgba(6,78,42,0.35),rgba(5,5,5,0.95))]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 z-[1] h-[550px] w-[550px] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-[120px] animate-pulse"
        aria-hidden="true"
      />

      {hasMedia ? <div className="hero-media-shade" aria-hidden /> : <div className="hero-aurora" aria-hidden />}

      {imageBg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={heroImage} alt={heroAlt?.trim() || ""} className="hero-media" />
      ) : null}

      {fileVideo && heroVideo ? (
        <video
          className="hero-media hero-media-video"
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
          poster={heroImage || undefined}
        />
      ) : null}

      {youtubeBg && embed ? (
        <div className="hero-media-frame" aria-hidden>
          <iframe
            src={youtubeBackgroundSrc(embed.id)}
            title=""
            allow="autoplay; encrypted-media"
            tabIndex={-1}
          />
        </div>
      ) : null}

      {vimeoBg && embed ? (
        <div className="hero-media-frame" aria-hidden>
          <iframe
            src={`${embed.src}?background=1&autoplay=1&muted=1&loop=1`}
            title=""
            allow="autoplay; encrypted-media"
            tabIndex={-1}
          />
        </div>
      ) : null}

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col justify-center px-4 pb-24 pt-28 sm:px-6 md:pb-20">
        <div className="flex w-full flex-col items-center text-center">
          
          {/* ─── Arrière-plan du Logo (Vert Sombre Stylé & Attirant) ─── */}
          <div className="group relative flex items-center justify-center p-4">
            {/* Halo de lueur vert émeraude sombre */}
            <div
              className="absolute inset-0 -m-4 rounded-full bg-gradient-to-tr from-[#06321b] via-[#094726] to-[#042112] opacity-80 blur-xl transition-all duration-700 group-hover:scale-110 group-hover:opacity-100 group-hover:blur-2xl"
              aria-hidden="true"
            />
            
            {/* Cadre vitré rond avec bordure vert sombre néon */}
            <div className="relative flex items-center justify-center rounded-full border border-emerald-500/30 bg-[#062414]/80 p-5 shadow-[0_0_50px_rgba(6,78,42,0.6)] backdrop-blur-md transition-transform duration-500 group-hover:scale-105 group-hover:border-emerald-400/60">
              <div className="hero-logo-ring" aria-hidden />
              <div className="hero-logo-spin">
                <BrandLogo href={null} size="hero" priority />
              </div>
            </div>
          </div>

          {/* ─── Titre Animé ─── */}
          <h1 className="hero-title mt-6 w-full max-w-5xl break-words font-display text-[clamp(1.75rem,6.5vw,4.75rem)] font-extrabold uppercase leading-[1.03] tracking-[-0.03em] text-paper sm:mt-8">
            <span className="hero-title-line inline-block opacity-0 animate-fade-in-up [animation-delay:200ms] [animation-fill-mode:forwards]">
              La révolution
            </span>{" "}
            <span className="hero-title-line hero-title-accent inline-block bg-gradient-to-r from-[#b8ff2e] via-[#34d399] to-[#c6ff00] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(52,211,153,0.4)] opacity-0 animate-fade-in-up [animation-delay:400ms] [animation-fill-mode:forwards]">
              culturelle
            </span>{" "}
            <span className="hero-title-line inline-block opacity-0 animate-fade-in-up [animation-delay:600ms] [animation-fill-mode:forwards]">
              &amp; marketing
            </span>
          </h1>

          {/* ─── Sous-titre Animé ─── */}
          <p className="hero-copy mx-auto mt-5 max-w-2xl px-1 text-sm leading-relaxed text-paper-muted sm:mt-6 sm:text-base md:text-lg opacity-0 animate-fade-in-up [animation-delay:800ms] [animation-fill-mode:forwards]">
            {tagline ||
              "Média, culture et contenus qui donnent une voix aux histoires, aux talents et aux événements."}
          </p>

          {/* ─── Boutons CTA Ultra-Stylés ─── */}
          <div className="hero-cta mt-8 flex w-full flex-col gap-3.5 sm:mt-10 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center opacity-0 animate-fade-in-up [animation-delay:1000ms] [animation-fill-mode:forwards]">
            <Link
              href="/a-propos"
              className="btn-interactive group inline-flex w-full items-center justify-center gap-2.5 rounded-xl border border-emerald-400/40 bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_30px_rgba(16,185,129,0.35)] transition-all hover:border-emerald-300 hover:from-emerald-500 hover:to-emerald-600 hover:shadow-[0_0_45px_rgba(16,185,129,0.5)] sm:w-auto sm:text-sm"
            >
              <Sparkles className="h-4 w-4 text-emerald-200 transition-transform group-hover:scale-110" />
              <span>Découvrir KISHA BUZZ</span>
              <ArrowRight className="h-4 w-4 text-white transition-transform group-hover:translate-x-1" />
            </Link>
            
            <Link
              href="/arena-culture"
              className="btn-interactive group inline-flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-black/60 px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md transition-all hover:border-amber-400/50 hover:bg-white/[0.1] hover:text-amber-300 sm:w-auto sm:text-sm"
            >
              <Mic2 className="h-4 w-4 text-amber-400 transition-transform group-hover:scale-110" />
              <span>Arena Culture</span>
            </Link>
          </div>
        </div>

        {/* ─── Indicateur Scroll ─── */}
        <a
          href="#actualites"
          className="hero-scroll absolute bottom-5 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-paper-muted transition-colors hover:text-emerald-400 opacity-0 animate-fade-in-up [animation-delay:1200ms] [animation-fill-mode:forwards]"
        >
          Scroll
          <span className="hero-scroll-line" aria-hidden />
        </a>
      </div>
    </section>
  );
}
