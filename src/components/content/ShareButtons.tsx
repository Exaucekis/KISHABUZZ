"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MessageCircle, Share2 } from "lucide-react";
import { absoluteUrl } from "@/lib/utils";

export function ShareButtons({
  title,
  path,
  compact = false,
  compactLabel = "Partager",
}: {
  title: string;
  path: string;
  compact?: boolean;
  compactLabel?: string;
}) {
  const [copied, setCopied] = useState(false);
  const url = useMemo(() => absoluteUrl(path), [path]);

  const encoded = encodeURIComponent(url);
  const text = encodeURIComponent(title);

  const copy = async () => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: title, url });
        return;
      } catch {
        // L’utilisateur peut fermer le menu de partage sans que ce soit une erreur à afficher.
        return;
      }
    }
    await copy();
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={nativeShare}
        className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm hover:bg-ink-3"
      >
        <Share2 className="h-4 w-4" />
        {compact ? (copied ? "Lien copié" : compactLabel) : "Partager / Story"}
      </button>
      {!compact ? (
        <>
      <a
        href={`https://wa.me/?text=${text}%20${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm hover:bg-ink-3"
      >
        <MessageCircle className="h-4 w-4" />
        WhatsApp
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm hover:bg-ink-3"
      >
        <Share2 className="h-4 w-4" />
        Facebook
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encoded}&text=${text}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm hover:bg-ink-3"
      >
        X
      </a>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm hover:bg-ink-3"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copié" : "Copier le lien"}
      </button>
        </>
      ) : null}
    </div>
  );
}
