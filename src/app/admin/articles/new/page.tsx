import { ArticleForm } from "@/components/admin/ArticleForm";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Nouvel article" };

export default async function NewArticlePage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="mb-5 font-[family-name:var(--font-syne)] text-2xl font-bold">
        Nouvel article / chronique
      </h1>
      <ArticleForm categories={categories} />
    </div>
  );
}
