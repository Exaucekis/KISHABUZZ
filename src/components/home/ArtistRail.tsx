"use client";

import { Heart, MessageCircle, Send, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { sendSpotlightArtistMessage } from "@/actions/spotlight-messages";
import { toggleSpotlightArtistLike } from "@/actions/spotlight-likes";
import { PublicImage } from "@/components/media/PublicImage";
import { ShareButtons } from "@/components/content/ShareButtons";
import type { SpotlightArtistCard } from "@/lib/spotlight-artists";

export type ArtistCard = SpotlightArtistCard;

function artistKey(artist: ArtistCard, index: number) {
  return artist.id || `${artist.name}-${index}`;
}

function ArtistSlide({
  artist,
  liked,
  likes,
  onToggleLike,
  onMessage,
  liking,
  duplicate = false,
}: {
  artist: ArtistCard;
  liked: boolean;
  likes: number;
  onToggleLike: () => void;
  onMessage: () => void;
  liking: boolean;
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
          <span className="artist-message-button" aria-hidden="true"><MessageCircle size={17} /></span>
        ) : (
          <button type="button" className="artist-message-button" onClick={onMessage} aria-label={`Partager ${artist.name} avec KISHA BUZZ`}>
            <MessageCircle size={17} />
          </button>
        )}
        {duplicate ? (
          <span className={`artist-like-button ${liked ? "is-liked" : ""}`} aria-hidden="true">
            <Heart size={18} fill={liked ? "currentColor" : "none"} />
            <span>{likes}</span>
          </span>
        ) : (
          <button
            type="button"
            className={`artist-like-button ${liked ? "is-liked" : ""}`}
            onClick={onToggleLike}
            disabled={liking}
            aria-label={`${likes} J’aime · ${liked ? `retirer votre like pour ${artist.name}` : `aimer ${artist.name}`}`}
            aria-pressed={liked}
          >
            <Heart size={18} fill={liked ? "currentColor" : "none"} />
            <span>{likes}</span>
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

export function ArtistRail({ artists, signedIn }: { artists: ArtistCard[]; signedIn: boolean }) {
  const [artistEngagement, setArtistEngagement] = useState(() =>
    Object.fromEntries(artists.map((artist, index) => [artistKey(artist, index), { liked: artist.liked, likes: artist.likes }]))
  );
  const [activeArtist, setActiveArtist] = useState<ArtistCard | null>(null);
  const [likeMessage, setLikeMessage] = useState("");
  const [isLiking, startLikeTransition] = useTransition();
  const router = useRouter();

  if (!artists.length) return null;

  function toggleLike(artist: ArtistCard, index: number) {
    if (!artist.id) return;
    const key = artistKey(artist, index);
    setLikeMessage("");
    startLikeTransition(async () => {
      const result = await toggleSpotlightArtistLike(artist.id!);
      if (!result.ok) {
        setLikeMessage(result.message);
        return;
      }
      setArtistEngagement((current) => ({
        ...current,
        [key]: { liked: result.liked, likes: result.count },
      }));
    });
  }

  function openMessage(artist: ArtistCard) {
    if (!signedIn) {
      router.push("/connexion?callbackUrl=/");
      return;
    }
    setActiveArtist(artist);
  }

  return (
    <section id="artistes-a-la-une" className="border-y border-line bg-ink-2 py-10 md:py-14 kb-defer" aria-label="Artistes à la une">
      <div className="mx-auto mb-6 flex max-w-7xl items-end justify-between gap-4 px-4 md:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ember-text">
            Spotlight
          </p>
          <h2 className="mt-2 font-display text-2xl md:text-4xl">Artistes à la une</h2>
        </div>
        <div className="flex items-center gap-3">
          <p className="hidden text-sm text-paper-muted sm:block">Culture · Scène · Médias</p>
          <ShareButtons
            title="Spotlight · Artistes à la une | KISHA BUZZ"
            path="/#artistes-a-la-une"
            compact
            compactLabel="Partager"
          />
        </div>
      </div>

      <div className="artist-rail">
        <div className="artist-rail-track">
          <div className="artist-rail-set">
            {artists.map((artist, i) => (
              <ArtistSlide
                key={artistKey(artist, i)}
                artist={artist}
                liked={artistEngagement[artistKey(artist, i)]?.liked || false}
                likes={artistEngagement[artistKey(artist, i)]?.likes || 0}
                onToggleLike={() => toggleLike(artist, i)}
                onMessage={() => openMessage(artist)}
                liking={isLiking}
              />
            ))}
          </div>
          <div className="artist-rail-set artist-rail-dup" aria-hidden>
            {artists.map((artist, i) => (
              <ArtistSlide
                key={`dup-${artistKey(artist, i)}`}
                artist={artist}
                liked={artistEngagement[artistKey(artist, i)]?.liked || false}
                likes={artistEngagement[artistKey(artist, i)]?.likes || 0}
                onToggleLike={() => {}}
                onMessage={() => {}}
                liking={false}
                duplicate
              />
            ))}
          </div>
        </div>
      </div>

      {likeMessage ? <p className="mx-auto mt-4 max-w-7xl px-4 text-sm text-rose-300 md:px-6">{likeMessage}</p> : null}

      {activeArtist?.id ? (
        <div className="spotlight-message-modal" role="dialog" aria-modal="true" aria-labelledby="spotlight-message-title">
          <button type="button" className="spotlight-message-modal__backdrop" aria-label="Fermer" onClick={() => setActiveArtist(null)} />
          <div className="spotlight-message-modal__panel">
            <button type="button" className="spotlight-message-modal__close" aria-label="Fermer" onClick={() => setActiveArtist(null)}>
              <X size={18} />
            </button>
            <div className="spotlight-message-modal__artist">
              <span className="spotlight-message-modal__portrait relative">
                <PublicImage src={activeArtist.image} alt="" fill sizes="56px" className="object-cover" />
              </span>
              <div>
                <p>Partage privé</p>
                <h3 id="spotlight-message-title">{activeArtist.name}</h3>
              </div>
            </div>
            <p className="spotlight-message-modal__intro">Partagez cette image et votre message avec l’équipe KISHA BUZZ. Il ne sera pas affiché publiquement.</p>
            <form action={sendSpotlightArtistMessage} className="spotlight-message-modal__form">
              <input type="hidden" name="artistId" value={activeArtist.id} />
              <label htmlFor="spotlight-private-message">Votre message</label>
              <textarea id="spotlight-private-message" name="body" required minLength={2} maxLength={1000} placeholder="Écrivez à l’équipe…" rows={4} />
              <button type="submit"><Send size={16} /> Envoyer en privé</button>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
