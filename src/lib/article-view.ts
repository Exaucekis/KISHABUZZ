import { auth } from "@/lib/auth";
import { getArticleBySlug } from "@/lib/data";
import { canAccessAdmin } from "@/lib/roles";

export async function resolveArticlePage(slug: string, previewRequested: boolean) {
  if (!previewRequested) {
    return { article: await getArticleBySlug(slug), isStaffPreview: false };
  }

  const session = await auth();
  if (!canAccessAdmin(session?.user?.role)) {
    return { article: await getArticleBySlug(slug), isStaffPreview: false };
  }

  const article = await getArticleBySlug(slug, { includeUnpublished: true });
  return {
    article,
    isStaffPreview: Boolean(article && article.status !== "PUBLISHED"),
  };
}
