import { PortfolioManager } from "@/components/admin/PortfolioManager";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Portfolio" };

export default async function AdminPortfolioPage() {
  const items = await prisma.portfolioItem.findMany({
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
  return (
    <div>
      <AdminPageIntro
        title="Portfolio"
        hint="Vos réalisations. Statut « Publié » pour les montrer sur /portfolio."
      />
      <PortfolioManager items={items} />
    </div>
  );
}
