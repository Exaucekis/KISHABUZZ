import { CategoriesManager } from "@/components/admin/CategoriesManager";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Catégories" };

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="mb-5 font-[family-name:var(--font-syne)] text-2xl font-bold">Catégories</h1>
      <CategoriesManager categories={categories} />
    </div>
  );
}
