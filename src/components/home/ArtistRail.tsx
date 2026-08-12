"use client";

import Link from "next/link";

export type ArtistCard = {
  name: string;
  role: string;
  image: string;
};

/** Liste réduite pour limiter le poids réseau */
const DEFAULT_ARTISTS: ArtistCard[] = [
  { name: "Gaz Mawete", role: "Artiste", image: "/artists/gaz-mawete.jpg" },
  { name: "Fally Ipupa", role: "Artiste", image: "/artists/fally-ipupa.jpg" },
  { name: "Innoss'B", role: "Artiste", image: "/artists/innoss-b.png" },
  { name: "Koffi Olomidé", role: "Légende", image: "/artists/koffi-olomide.jpg" },
  { name: "Ferré Gola", role: "Artiste", image: "/artists/ferre-gola.jpg" },
  { name: "Damso", role: "Rap / Scène", image: "/artists/damso.jpg" },
];

export function ArtistRail({ artists = DEFAULT_ARTISTS }: { artists?: ArtistCard[] }) {
  const loop = [...artists, ...artists];

  return (
    <section className="border-y border-line bg-ink-2 py-10 md:py-14 kb-defer" aria-label="Artistes à la une">
      <div className="mx-auto mb-6 flex max-w-7xl items-end justify-between gap-4 px-4 md:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ember-text">
            Spotlight
          </p>
          <h2 className="mt-2 font-display text-2xl md:text-4xl">Artistes à la une</h2>
        </div>
        <p className="hidden text-sm text-paper-muted sm:block">Culture · Scène · Médias</p>
      </div>

      <div className="artist-rail">
        <div className="artist-rail-track">
          {loop.map((artist, i) => (
            <article key={`${artist.name}-${i}`} className="artist-card">
              <div className="artist-card-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={artist.image}
                  alt={artist.name}
                  loading="lazy"
                  decoding="async"
                  width={220}
                  height={300}
                />
                <div className="artist-card-shade" />
              </div>
              <div className="artist-card-meta">
                <p className="artist-card-name">{artist.name}</p>
                <p className="artist-card-role">{artist.role}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
