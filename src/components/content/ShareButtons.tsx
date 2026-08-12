"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MessageCircle, Share2 } from "lucide-react";
import { absoluteUrl } from "@/lib/utils";

export function ShareButtons({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState(false);
  const url = useMemo(() => absoluteUrl(path), [path]);

  const encoded = encodeURIComponent(url);
  const text = encodeURIComponent(title);

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap gap-2">
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
    </div>
  );
}
