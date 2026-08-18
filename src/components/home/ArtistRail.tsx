import Image from "next/image";
import type { SpotlightArtistCard } from "@/lib/spotlight-artists";

export type ArtistCard = SpotlightArtistCard;

export function ArtistRail({ artists }: { artists: ArtistCard[] }) {
  if (!artists.length) return null;

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
              <div className="artist-card-media relative">
                <Image
                  src={artist.image}
                  alt={artist.name}
                  fill
                  sizes="240px"
                  className="object-cover"
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
