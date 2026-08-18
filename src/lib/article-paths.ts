export function articlePublicPath(contentType: string, slug: string) {
  return contentType === "CHRONIQUE" ? `/chroniques/${slug}` : `/publications/${slug}`;
}

export function articlePreviewPath(contentType: string, slug: string) {
  return `${articlePublicPath(contentType, slug)}?preview=1`;
}

export function articleEditPath(id: string) {
  return `/admin/articles/${id}`;
}

export function isPreviewQuery(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "1" || raw === "true";
}
