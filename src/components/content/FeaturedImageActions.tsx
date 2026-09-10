"use client";

import { Heart } from "lucide-react";
import { useState, useTransition } from "react";
import { toggleFeaturedImageLike, type FeaturedImageTargetType } from "@/actions/featured-image";
import { ShareButtons } from "@/components/content/ShareButtons";

export function FeaturedImageActions({
  targetType,
  targetId,
  initialLikes,
  initialLiked,
  title,
  path,
  dark = false,
}: {
  targetType: FeaturedImageTargetType;
  targetId: string;
  initialLikes: number;
  initialLiked: boolean;
  title: string;
  path: string;
  dark?: boolean;
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const tone = dark ? "border-white/30 bg-black/45 text-white hover:bg-black/65" : "border-line bg-ink text-paper hover:bg-ink-3";

  function like() {
    setMessage("");
    startTransition(async () => {
      const result = await toggleFeaturedImageLike(targetType, targetId);
      if (!result.ok) return setMessage(result.message);
      setLiked(result.liked);
      setLikes(result.count);
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={like}
          disabled={pending}
          aria-pressed={liked}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition ${tone} ${liked ? "!border-rose-400 !text-rose-400" : ""}`}
        >
          <Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} />
          {liked ? "Aimé" : "J’aime"}
        </button>
        <span
          className={`inline-flex min-h-10 items-center rounded-full border px-3 py-2 text-sm font-semibold ${tone}`}
          aria-label={`${likes} J’aime`}
        >
          {likes} J’aime
        </span>
        <ShareButtons title={title} path={path} compact />
      </div>
      {message ? <p className={dark ? "text-xs text-white/80" : "text-xs text-paper-muted"}>{message}</p> : null}
    </div>
  );
}
