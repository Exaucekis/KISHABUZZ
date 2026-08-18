export function imageAlt(preferred?: string | null, fallback = "") {
  return (preferred || "").trim() || fallback.trim();
}

export function escapeHtmlAttr(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function articleInlineImageTag(src: string, alt: string) {
  return `<img src="${escapeHtmlAttr(src)}" alt="${escapeHtmlAttr(alt)}" />`;
}
