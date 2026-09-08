"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Sparkles } from "lucide-react";
import { ShareButtons } from "@/components/content/ShareButtons";

const BACKGROUNDS = [
  "/arena/albums/invitee-plateau/02-plateau.jpg",
  "/arena/albums/invitee-plateau/01-invitee.jpg",
  "/arena/albums/invitee-plateau/03-plateau-wide.jpg",
  "/arena/albums/invitee-plateau/04-animateur.jpg",
];

type Props = {
  description: string;
  line1?: string;
  line2?: string;
  line3?: string;
  spotlightTitle?: string;
  spotlightHref?: string;
  poster?: string;
  ctaLabel?: string;
  shareTitle?: string;
  sharePath?: string;
};

export function ArenaHero({
  description,
  line1 = "Culture.",
  line2 = "Émissions.",
  line3 = "Live.",
  spotlightTitle,
  spotlightHref,
  poster,
  ctaLabel,
  shareTitle,
  sharePath,
}: Props) {
  const lead =
    description.length > 110 ? `${description.slice(0, 107).trim()}…` : description;
  const slides = useMemo(() => (poster ? [poster] : BACKGROUNDS), [poster]);
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !visible) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, 7000);
    return () => window.clearInterval(id);
  }, [visible, slides.length]);

  const next = (active + 1) % slides.length;

  return (
    <section ref={rootRef} className="ac-hero relative">
      <div className="ac-hero__slides" aria-hidden>
        {slides.map((src, i) => {
          if (i !== active && i !== next) return null;
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt=""
              className={`ac-hero__bg${i === active ? " is-active" : ""}`}
              decoding="async"
              fetchPriority={i === active ? "high" : "low"}
              loading={i === active ? "eager" : "lazy"}
            />
          );
        })}
      </div>
      
      {/* Ombre progressive cinématique */}
      <div className="ac-hero__fade" aria-hidden />

      <div className="ac-hero__content relative z-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1.5 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 animate-pulse text-amber-400" />
          <span className="text-[0.72rem] font-bold uppercase tracking-wider text-amber-300">
            Arena Culture · Streaming &amp; Média
          </span>
        </div>

        <h1 className="ac-hero__title">
          <span className="block">{line1}</span>
          <span className="block">{line2}</span>
          <em className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(245,158,11,0.4)]">
            {line3}
          </em>
        </h1>

        <p className="ac-hero__text max-w-xl">{lead}</p>

        <div className="ac-hero__cta mt-6 flex flex-wrap items-center gap-3">
          <Link
            href={spotlightHref || "/arena-culture/emissions"}
            className="group inline-flex items-center gap-2.5 rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-amber-500/25 transition-all hover:scale-105 hover:shadow-amber-500/40 sm:text-sm"
          >
            <Play className="h-4 w-4 fill-black text-black transition-transform group-hover:scale-110" />
            <span>{ctaLabel || (spotlightTitle ? `Prochain · ${spotlightTitle}` : "Voir les émissions")}</span>
          </Link>
          
          <Link
            href="/arena-culture/photos"
            className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-black/40 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md transition-all hover:border-amber-400/40 hover:bg-white/10 hover:text-amber-300 sm:text-sm"
          >
            Galerie Photos
          </Link>
          {shareTitle && sharePath ? <ShareButtons title={shareTitle} path={sharePath} compact /> : null}
        </div>
      </div>

      <div className="ac-hero__dots" aria-hidden>
        {slides.map((_, i) => (
          <span key={i} className={i === active ? "is-active" : undefined} />
        ))}
      </div>
    </section>
  );
}
