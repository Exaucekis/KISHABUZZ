export const IMAGE_MAX_BYTES = 4 * 1024 * 1024;
export const VIDEO_MAX_BYTES = 200 * 1024 * 1024;

export const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

export const VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-m4v",
]);

export const MEDIA_FOLDERS = new Set([
  "articles",
  "media",
  "logos",
  "covers",
  "guests",
  "albums",
  "artists",
  "settings",
  "icons",
]);

export function mediaExtension(type: string, filename: string) {
  const fromName = filename.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] || "";
  if (
    [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".mp4", ".webm", ".ogg", ".mov", ".m4v"].includes(
      fromName
    )
  ) {
    return fromName === ".jpeg" ? ".jpg" : fromName;
  }
  if (type === "image/jpeg") return ".jpg";
  if (type === "image/png") return ".png";
  if (type === "image/webp") return ".webp";
  if (type === "image/gif") return ".gif";
  if (type === "image/svg+xml") return ".svg";
  if (type === "video/webm") return ".webm";
  if (type === "video/ogg") return ".ogg";
  if (type === "video/quicktime") return ".mov";
  if (type === "video/x-m4v") return ".m4v";
  return ".mp4";
}

export function mediaFolder(raw: string) {
  const folder = raw.replace(/[^a-z]/gi, "");
  return MEDIA_FOLDERS.has(folder) ? folder : "media";
}

export function uniqueMediaName(folder: string, ext: string) {
  return `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
}
