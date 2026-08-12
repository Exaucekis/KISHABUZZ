import { PortfolioManager } from "@/components/admin/PortfolioManager";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Portfolio" };

export default async function AdminPortfolioPage() {
  const items = await prisma.portfolioItem.findMany({
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
  return (
    <div>
      <h1 className="mb-5 font-[family-name:var(--font-syne)] text-2xl font-bold">Portfolio</h1>
      <PortfolioManager items={items} />
    </div>
  );
}
