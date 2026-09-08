export type MediaProvider = "youtube" | "vimeo" | "instagram" | "facebook" | "tiktok";

export type MediaEmbed = {
  provider: MediaProvider;
  id: string;
  src: string;
  ratio: "16/9" | "9/16" | "4/5";
  originalUrl: string;
};

export const IMAGE_EXT = /\.(avif|bmp|gif|jpe?g|png|svg|webp)(\?.*)?$/i;
const VIDEO_EXT = /\.(mp4|webm|ogg|mov)(\?.*)?$/i;

export function isDirectVideo(url: string) {
  if (!url) return false;
  if (parseMediaEmbed(url)) return false;
  if (IMAGE_EXT.test(url)) return false;
  if (VIDEO_EXT.test(url)) return true;
  if (url.startsWith("/arena/videos/") || url.startsWith("/uploads/media/")) return true;
  if (url.startsWith("/uploads/") && /\/(media|videos)\//.test(url)) return true;
  if (/blob\.vercel-storage\.com|vercel-storage\.com/.test(url) && /\/(media|videos)\//.test(url)) {
    return true;
  }
  return false;
}

export function arenaShowVideo(show: {
  videoUrl?: string | null;
  media?: Array<{ kind?: string | null; url?: string | null }> | null;
}) {
  const direct = String(show.videoUrl || "").trim();
  if (direct) return direct;
  const fromMedia = (show.media || []).find(
    (item) => item.kind === "VIDEO" && String(item.url || "").trim()
  );
  return String(fromMedia?.url || "").trim();
}

export function isDirectImage(url: string) {
  if (!url) return false;
  if (url.startsWith("data:image/")) return true;
  if (IMAGE_EXT.test(url)) return true;
  if (url.includes("blob.vercel-storage.com")) return !VIDEO_EXT.test(url);
  if (url.startsWith("/uploads/") || url.startsWith("/brand/") || url.startsWith("/arena/")) {
    return !VIDEO_EXT.test(url);
  }
  return false;
}

export function isImageSrc(value: string) {
  return Boolean(value) && isDirectImage(value) && !parseMediaEmbed(value);
}

export function parseMediaEmbed(raw: string): MediaEmbed | null {
  if (!raw) return null;
  const url = raw.trim();

  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/
  );
  if (yt) {
    return {
      provider: "youtube",
      id: yt[1],
      src: `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1&playsinline=1`,
      ratio: "16/9",
      originalUrl: url,
    };
  }

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) {
    return {
      provider: "vimeo",
      id: vimeo[1],
      src: `https://player.vimeo.com/video/${vimeo[1]}`,
      ratio: "16/9",
      originalUrl: url,
    };
  }

  const ig = url.match(/instagram\.com\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
  if (ig) {
    const isReel = /\/reels?\//.test(url);
    const path = isReel ? "reel" : url.includes("/tv/") ? "tv" : "p";
    return {
      provider: "instagram",
      id: ig[1],
      src: `https://www.instagram.com/${path}/${ig[1]}/embed/`,
      ratio: isReel ? "9/16" : "4/5",
      originalUrl: url,
    };
  }

  const tiktok = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
  if (tiktok) {
    return {
      provider: "tiktok",
      id: tiktok[1],
      src: `https://www.tiktok.com/embed/v2/${tiktok[1]}`,
      ratio: "9/16",
      originalUrl: url,
    };
  }

  if (/facebook\.com\/|fb\.watch\//.test(url)) {
    const isFbVideo = /facebook\.com\/(?:watch|reel|.*\/videos\/)|fb\.watch/.test(url);
    const plugin = isFbVideo ? "video.php" : "post.php";
    const extra = isFbVideo ? "show_text=false&width=560" : "show_text=true&width=500";
    return {
      provider: "facebook",
      id: url,
      src: `https://www.facebook.com/plugins/${plugin}?href=${encodeURIComponent(url)}&${extra}`,
      ratio: isFbVideo ? "16/9" : "4/5",
      originalUrl: url,
    };
  }

  return null;
}

export function isPlayableMedia(url: string) {
  return Boolean(url) && (Boolean(parseMediaEmbed(url)) || isDirectVideo(url));
}

export function youtubeBackgroundSrc(id: string) {
  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&playsinline=1&rel=0`;
}

export function videoPoster(url: string, thumbnail?: string | null) {
  const custom = String(thumbnail || "").trim();
  if (custom) return custom;
  const embed = parseMediaEmbed(url);
  if (embed?.provider === "youtube") {
    return `https://i.ytimg.com/vi/${embed.id}/hqdefault.jpg`;
  }
  return "";
}
