import { MediaManager } from "@/components/admin/MediaManager";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Médias" };

type Props = { searchParams: Promise<{ kind?: string }> };

export default async function AdminMediaPage({ searchParams }: Props) {
  const { kind } = await searchParams;
  const items = await prisma.mediaAsset.findMany({
    where: kind ? { kind } : undefined,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <h1 className="mb-5 font-[family-name:var(--font-syne)] text-2xl font-bold">Médias / Galerie</h1>
      <MediaManager items={items} />
    </div>
  );
}
