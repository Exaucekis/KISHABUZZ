"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

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
    <section ref={rootRef} className="ac-hero">
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
      <div className="ac-hero__fade" aria-hidden />

      <div className="ac-hero__content">
        <h1 className="ac-hero__title">
          {line1}
          <br />
          {line2}
          <br />
          <em>{line3}</em>
        </h1>
        <p className="ac-hero__text">{lead}</p>
        <div className="ac-hero__cta">
          <Link href={spotlightHref || "/arena-culture/emissions"} className="ac-btn ac-btn--primary">
            {ctaLabel || (spotlightTitle ? `Prochain · ${spotlightTitle}` : "Voir les émissions")}
          </Link>
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
