import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ArticleDetail } from "@/components/content/ArticleDetail";
import { articlePreviewPath, articlePublicPath, isPreviewQuery } from "@/lib/article-paths";
import { resolveArticlePage } from "@/lib/article-view";
import { getRelatedArticles } from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { preview } = await searchParams;
  const { article, isStaffPreview } = await resolveArticlePage(slug, isPreviewQuery(preview));
  if (!article) return { title: "Publication" };
  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt,
    robots: isStaffPreview ? { index: false, follow: false } : undefined,
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt,
      images: article.coverImage ? [article.coverImage] : undefined,
    },
  };
}

export default async function PublicationDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const previewRequested = isPreviewQuery(preview);
  const { article, isStaffPreview } = await resolveArticlePage(slug, previewRequested);
  if (!article) notFound();
  if (article.contentType === "CHRONIQUE") {
    redirect(previewRequested ? articlePreviewPath("CHRONIQUE", article.slug) : articlePublicPath("CHRONIQUE", article.slug));
  }

  const related = await getRelatedArticles(article);
  return <ArticleDetail article={article} related={related} isStaffPreview={isStaffPreview} />;
}
