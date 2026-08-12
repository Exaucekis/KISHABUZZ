"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const BACKGROUNDS = [
  "/arena/albums/invitee-plateau/02-plateau.jpg",
  "/arena/albums/invitee-plateau/01-invitee.jpg",
  "/arena/albums/invitee-plateau/03-plateau-wide.jpg",
  "/arena/albums/invitee-plateau/04-animateur.jpg",
];

type Props = {
  description: string;
  spotlightTitle?: string;
  spotlightHref?: string;
};

export function ArenaHero({ description, spotlightTitle, spotlightHref }: Props) {
  const lead =
    description.length > 110 ? `${description.slice(0, 107).trim()}…` : description;
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
      setActive((i) => (i + 1) % BACKGROUNDS.length);
    }, 7000);
    return () => window.clearInterval(id);
  }, [visible]);

  const next = (active + 1) % BACKGROUNDS.length;

  return (
    <section ref={rootRef} className="ac-hero">
      <div className="ac-hero__slides" aria-hidden>
        {BACKGROUNDS.map((src, i) => {
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
          Culture.
          <br />
          Émissions.
          <br />
          <em>Live.</em>
        </h1>
        <p className="ac-hero__text">{lead}</p>
        <div className="ac-hero__cta">
          <Link href={spotlightHref || "/arena-culture/emissions"} className="ac-btn ac-btn--primary">
            {spotlightTitle ? `Prochain · ${spotlightTitle}` : "Voir les émissions"}
          </Link>
          <Link href="/arena-culture/invites" className="ac-btn ac-btn--ghost">
            Invités
          </Link>
        </div>
      </div>

      <div className="ac-hero__dots" aria-hidden>
        {BACKGROUNDS.map((_, i) => (
          <span key={i} className={i === active ? "is-active" : undefined} />
        ))}
      </div>
    </section>
  );
}
