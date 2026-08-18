"use client";

import { VideoEmbed } from "@/components/media/VideoEmbed";
import { parseMediaEmbed } from "@/lib/media";

function decodeAttr(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function normalize(html: string) {
  return html.replace(
    /<p>\s*(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be|instagram\.com|facebook\.com|fb\.watch|tiktok\.com|vimeo\.com)[^\s<]*)\s*<\/p>/gi,
    (_match, url: string) =>
      parseMediaEmbed(url) ? `<div data-kb-embed="${url.replace(/"/g, "&quot;")}"></div>` : _match
  );
}

export function ArticleBody({ html, className }: { html: string; className?: string }) {
  const prepared = normalize(html || "");
  const parts: Array<{ type: "html" | "embed"; value: string }> = [];
  const re = /<div\s+data-kb-embed="([^"]+)"\s*><\/div>/gi;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(prepared))) {
    if (match.index > last) {
      parts.push({ type: "html", value: prepared.slice(last, match.index) });
    }
    parts.push({ type: "embed", value: decodeAttr(match[1]) });
    last = match.index + match[0].length;
  }
  if (last < prepared.length) {
    parts.push({ type: "html", value: prepared.slice(last) });
  }

  if (!parts.length) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: prepared }} />;
  }

  return (
    <div className={className}>
      {parts.map((part, i) =>
        part.type === "html" ? (
          <div key={i} dangerouslySetInnerHTML={{ __html: part.value }} />
        ) : (
          <div key={i} className="my-6">
            <VideoEmbed url={part.value} />
          </div>
        )
      )}
    </div>
  );
}
