import { AlbumsManager } from "@/components/admin/AlbumsManager";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Albums photos Arena" };

export default async function AdminArenaAlbumsPage() {
  const albums = await prisma.photoAlbum.findMany({
    include: { _count: { select: { photos: true } } },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <h1 className="mb-2 font-[family-name:var(--font-syne)] text-2xl font-bold">
        Albums photos Arena
      </h1>
      <p className="mb-5 text-sm text-[#9aa3b5]">
        Un album = un invité du jour (ex. Maman Sharonne). Gérez ensuite les photos dans chaque album.
      </p>
      <AlbumsManager albums={albums} />
    </div>
  );
}
