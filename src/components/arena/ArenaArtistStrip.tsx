"use client";

import { useMemo } from "react";
import { PLACEHOLDER_IMAGE } from "@/lib/placeholders";

const ARTISTS = [
  { name: "Gaz Mawete", image: PLACEHOLDER_IMAGE },
  { name: "Fally Ipupa", image: PLACEHOLDER_IMAGE },
  { name: "Innoss'B", image: PLACEHOLDER_IMAGE },
  { name: "Koffi Olomidé", image: PLACEHOLDER_IMAGE },
  { name: "Ferré Gola", image: PLACEHOLDER_IMAGE },
  { name: "Dadju", image: PLACEHOLDER_IMAGE },
  { name: "Damso", image: PLACEHOLDER_IMAGE },
  { name: "Werrason", image: PLACEHOLDER_IMAGE },
];

export function ArenaArtistStrip() {
  const loop = useMemo(() => [...ARTISTS, ...ARTISTS], []);

  return (
    <section className="arena-rail" aria-label="Scène culturelle">
      <div className="arena-rail-head">
        <p>Sur la scène</p>
        <h2>Visages & voix</h2>
      </div>
      <div className="arena-rail-track">
        {loop.map((a, i) => (
          <figure key={`${a.name}-${i}`} className="arena-rail-item">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a.image} alt={a.name} loading="lazy" />
            <figcaption>{a.name}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
