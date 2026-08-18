import { isDirectVideo, isImageSrc, parseMediaEmbed } from "@/lib/media";

export type LibraryKind = "IMAGE" | "VIDEO";

export type LibraryItem = {
  url: string;
  kind: LibraryKind;
  title: string;
  createdAt: number;
};

export function classifyLibraryUrl(url: string): LibraryKind | null {
  const value = url.trim();
  if (!value) return null;
  if (parseMediaEmbed(value) || isDirectVideo(value)) return "VIDEO";
  if (isImageSrc(value)) return "IMAGE";
  if (value.startsWith("/uploads/") || value.includes("blob.vercel-storage.com")) {
    return isDirectVideo(value) ? "VIDEO" : "IMAGE";
  }
  if (/^https?:\/\//i.test(value) && !value.startsWith("mailto:")) return "IMAGE";
  return null;
}

export function mergeLibraryItems(rows: LibraryItem[]): LibraryItem[] {
  const seen = new Set<string>();
  const out: LibraryItem[] = [];
  for (const row of rows) {
    const url = row.url.trim();
    if (!url || seen.has(url)) continue;
    const kind = row.kind || classifyLibraryUrl(url);
    if (!kind) continue;
    seen.add(url);
    out.push({
      url,
      kind,
      title: row.title.trim() || url.split("/").pop() || "Média",
      createdAt: row.createdAt || 0,
    });
  }
  return out.sort((a, b) => b.createdAt - a.createdAt);
}

export function filterLibraryItems(items: LibraryItem[], kind: "image" | "video" | "any") {
  if (kind === "any") return items;
  const wanted: LibraryKind = kind === "video" ? "VIDEO" : "IMAGE";
  return items.filter((item) => item.kind === wanted);
}
