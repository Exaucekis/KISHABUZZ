"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type VideoEmbedProps = {
    url: string;
    title?: string;
    poster?: string;
    className?: string;
    aspect?: "16/9" | "21/9" | "4/3";
    lazy?: boolean;
};

type EmbedProvider = {
    name: string;
    embed: (id: string) => string;
    thumbnail?: (id: string) => string;
};

const PROVIDERS: Record<string, EmbedProvider> = {
    youtube: {
        name: "youtube",
        // Le lecteur standard est plus fiable que l'endpoint no-cookie sur les réseaux partagés.
        // La vidéo ne démarre qu'après le clic de l'utilisateur, sans lecture automatique.
        embed: (id) => `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`,
        thumbnail: (id) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    },
    vimeo: {
        name: "vimeo",
        embed: (id) => `https://player.vimeo.com/video/${id}?autoplay=1&title=0&byline=0&portrait=0`,
    },
    dailymotion: {
        name: "dailymotion",
        embed: (id) => `https://www.dailymotion.com/embed/video/${id}?autoplay=1`,
    },
    file: {
        name: "file",
        embed: (id) => id,
    },
};

function parseVideoUrl(url: string): { provider: EmbedProvider; id: string } | null {
    const trimmed = url.trim();
    if (!trimmed) return null;

    // YouTube — youtu.be / watch?v= / embed / shorts
    const ytShort = trimmed.match(/(?:youtu\.be\/|youtube\.com\/shorts\/)([\w-]{11})/);
    if (ytShort) return { provider: PROVIDERS.youtube, id: ytShort[1] };

    const ytWatch = trimmed.match(/[?&]v=([\w-]{11})/);
    if (ytWatch) return { provider: PROVIDERS.youtube, id: ytWatch[1] };

    const ytEmbed = trimmed.match(/youtube\.com\/embed\/([\w-]{11})/);
    if (ytEmbed) return { provider: PROVIDERS.youtube, id: ytEmbed[1] };

    // Vimeo
    const vimeo = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeo) return { provider: PROVIDERS.vimeo, id: vimeo[1] };

    // Dailymotion
    const dm = trimmed.match(/dailymotion\.com\/(?:video|embed\/video)\/([a-zA-Z0-9]+)/);
    if (dm) return { provider: PROVIDERS.dailymotion, id: dm[1] };

    // Fichier direct (mp4, webm, etc.)
    if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(trimmed)) {
        return { provider: PROVIDERS.file, id: trimmed };
    }

    return null;
}

export function VideoEmbed({
    url,
    title = "Vidéo",
    poster,
    className,
    aspect = "16/9",
}: VideoEmbedProps) {
    const [activated, setActivated] = useState(false);
    const [visible, setVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const parsed = parseVideoUrl(url);
    const isFile = parsed?.provider.name === "file";

    // Reveal-on-scroll pour fluidité
    useEffect(() => {
        if (!containerRef.current) return;
        const el = containerRef.current;
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisible(true);
                        io.disconnect();
                    }
                });
            },
            { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    const handleActivate = useCallback(() => setActivated(true), []);

    // Fallback : si on n'arrive pas à parser, on tente un iframe générique
    const embedSrc = parsed ? parsed.provider.embed(parsed.id) : url;
    const posterSrc = poster || (parsed?.provider.thumbnail ? parsed.provider.thumbnail(parsed.id) : "");

    const aspectStyle = {
        "16/9": "16 / 9",
        "21/9": "21 / 9",
        "4/3": "4 / 3",
    }[aspect];

    return (
        <div
            ref={containerRef}
            className={cn("kb-embed", className)}
            style={{ aspectRatio: aspectStyle }}
            data-provider={parsed?.provider.name || "generic"}
            data-active={activated}
        >
            {/* Poster + bouton play (avant activation) */}
            {!activated && (
                <button
                    type="button"
                    onClick={handleActivate}
                    className="kb-embed__poster"
                    aria-label={`Lire la vidéo : ${title}`}
                >
                    {posterSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={posterSrc}
                            alt={title}
                            className="kb-embed__poster-img"
                            loading="lazy"
                            decoding="async"
                        />
                    ) : (
                        <div className="kb-embed__poster-fallback" aria-hidden />
                    )}

                    <span className="kb-embed__overlay" aria-hidden />

                    <span className="kb-embed__play" aria-hidden>
                        <svg viewBox="0 0 88 88" fill="none" className="kb-embed__play-icon">
                            <circle cx="44" cy="44" r="42" stroke="currentColor" strokeWidth="2" opacity="0.5" />
                            <circle cx="44" cy="44" r="36" fill="currentColor" />
                            <path d="M36 30 L60 44 L36 58 Z" fill="#050505" />
                        </svg>
                        <span className="kb-embed__play-ring" />
                        <span className="kb-embed__play-ring kb-embed__play-ring--2" />
                    </span>

                    <span className="kb-embed__caption">
                        <span className="kb-embed__caption-label">Arena Culture</span>
                        <span className="kb-embed__caption-title">{title}</span>
                    </span>
                </button>
            )}

            {/* Iframe (après activation) */}
            {activated && !isFile && (
                <iframe
                    src={embedSrc}
                    title={title}
                    className="kb-embed__frame"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                />
            )}

            {/* Fichier vidéo natif */}
            {activated && isFile && (
                <video
                    src={embedSrc}
                    aria-label={title}
                    poster={posterSrc || undefined}
                    className="kb-embed__frame"
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                />
            )}

            {/* Glow décoratif (révélé au scroll) */}
            <span className={cn("kb-embed__glow", visible && "is-visible")} aria-hidden />
        </div>
    );
}
