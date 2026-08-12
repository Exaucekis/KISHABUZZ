import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  return { title: article ? `Éditer · ${article.title}` : "Article" };
}

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;
  const [article, categories] = await Promise.all([
    prisma.article.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!article) notFound();

  return (
    <div>
      <h1 className="mb-5 font-[family-name:var(--font-syne)] text-2xl font-bold">
        Éditer · {article.title}
      </h1>
      <ArticleForm article={article} categories={categories} />
    </div>
  );
}
