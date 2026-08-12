import { DomainsManager } from "@/components/admin/DomainsManager";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Domaines" };

export default async function AdminDomainsPage() {
  const domains = await prisma.domain.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] });
  return (
    <div>
      <h1 className="mb-5 font-[family-name:var(--font-syne)] text-2xl font-bold">Domaines</h1>
      <DomainsManager domains={domains} />
    </div>
  );
}
