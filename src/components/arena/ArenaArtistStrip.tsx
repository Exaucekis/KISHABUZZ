"use client";

import { useMemo } from "react";

const ARTISTS = [
  { name: "Gaz Mawete", image: "/artists/gaz-mawete.jpg" },
  { name: "Fally Ipupa", image: "/artists/fally-ipupa.jpg" },
  { name: "Innoss'B", image: "/artists/innoss-b.png" },
  { name: "Koffi Olomidé", image: "/artists/koffi-olomide.jpg" },
  { name: "Ferré Gola", image: "/artists/ferre-gola.jpg" },
  { name: "Dadju", image: "/artists/dadju.jpg" },
  { name: "Damso", image: "/artists/damso.jpg" },
  { name: "Werrason", image: "/artists/werrason.jpg" },
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
