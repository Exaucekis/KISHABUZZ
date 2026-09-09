"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { PublicImage } from "@/components/media/PublicImage";
import type { SpotlightArtistCard } from "@/lib/spotlight-artists";

export type ArtistCard = SpotlightArtistCard;

function artistKey(artist: ArtistCard, index: number) {
  return artist.id || `${artist.name}-${index}`;
}

function ArtistSlide({
  artist,
  liked,
  onToggleLike,
  duplicate = false,
}: {
  artist: ArtistCard;
  liked: boolean;
  onToggleLike: () => void;
  duplicate?: boolean;
}) {
  return (
    <article className="artist-card">
      <div className="artist-card-media relative">
        <PublicImage
          src={artist.image}
          alt={artist.name}
          fill
          sizes="240px"
          className="object-cover"
        />
        <div className="artist-card-shade" />
        {duplicate ? (
          <span className={`artist-like-button ${liked ? "is-liked" : ""}`} aria-hidden="true">
            <Heart size={18} fill={liked ? "currentColor" : "none"} />
          </span>
        ) : (
          <button
            type="button"
            className={`artist-like-button ${liked ? "is-liked" : ""}`}
            onClick={onToggleLike}
            aria-label={liked ? `Retirer ${artist.name} de vos favoris` : `Ajouter ${artist.name} à vos favoris`}
            aria-pressed={liked}
          >
            <Heart size={18} fill={liked ? "currentColor" : "none"} />
          </button>
        )}
      </div>
      <div className="artist-card-meta">
        <p className="artist-card-name">{artist.name}</p>
        <p className="artist-card-role">{artist.role}</p>
      </div>
    </article>
  );
}

export function ArtistRail({ artists }: { artists: ArtistCard[] }) {
  const [likedArtists, setLikedArtists] = useState<string[]>([]);

  useEffect(() => {
    const saved = window.localStorage.getItem("kishabuzz-liked-spotlight-artists");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || !parsed.every((id) => typeof id === "string")) return;
      const frame = window.requestAnimationFrame(() => setLikedArtists(parsed));
      return () => window.cancelAnimationFrame(frame);
    } catch {
      window.localStorage.removeItem("kishabuzz-liked-spotlight-artists");
    }
  }, []);

  if (!artists.length) return null;

  function toggleLike(id: string) {
    setLikedArtists((current) => {
      const next = current.includes(id) ? current.filter((artistId) => artistId !== id) : [...current, id];
      window.localStorage.setItem("kishabuzz-liked-spotlight-artists", JSON.stringify(next));
      return next;
    });
  }

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
          <div className="artist-rail-set">
            {artists.map((artist, i) => (
              <ArtistSlide
                key={artistKey(artist, i)}
                artist={artist}
                liked={likedArtists.includes(artistKey(artist, i))}
                onToggleLike={() => toggleLike(artistKey(artist, i))}
              />
            ))}
          </div>
          <div className="artist-rail-set artist-rail-dup" aria-hidden>
            {artists.map((artist, i) => (
              <ArtistSlide
                key={`dup-${artistKey(artist, i)}`}
                artist={artist}
                liked={likedArtists.includes(artistKey(artist, i))}
                onToggleLike={() => {}}
                duplicate
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
