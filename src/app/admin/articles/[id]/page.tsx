import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { AdminPageIntro } from "@/components/admin/AdminHint";
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
    prisma.article.findUnique({
      where: { id },
      include: { tags: { include: { tag: true } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!article) notFound();

  return (
    <div>
      <AdminPageIntro
        title={`Éditer · ${article.title}`}
        hint="Modifiez puis Enregistrer. « Voir comme sur le site » ouvre l’aperçu, même en brouillon. Le statut « Publié » met à jour le site."
      />
      <ArticleForm
        article={{
          ...article,
          tags: article.tags.map((row) => row.tag.name).join(", "),
        }}
        categories={categories}
      />
    </div>
  );
}
