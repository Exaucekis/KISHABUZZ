import { PagesManager } from "@/components/admin/PagesManager";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Pages" };

export default async function AdminPagesPage() {
  const pages = await prisma.pageContent.findMany({ orderBy: { key: "asc" } });
  return (
    <div>
      <h1 className="mb-5 font-[family-name:var(--font-syne)] text-2xl font-bold">
        Contenus de pages
      </h1>
      <PagesManager pages={pages} />
    </div>
  );
}
