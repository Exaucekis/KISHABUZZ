import { AlbumsManager } from "@/components/admin/AlbumsManager";
import { ArenaAdminNav } from "@/components/admin/ArenaAdminNav";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Albums photos Arena" };

export default async function AdminArenaAlbumsPage() {
  const albums = await prisma.photoAlbum.findMany({
    include: { _count: { select: { photos: true } } },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <AdminPageIntro
        title="Albums photos Arena"
        hint="Un album = un invité. Glissez pour changer l’ordre, puis Photos pour ajouter les images."
      />
      <ArenaAdminNav current="/admin/arena/albums" />
      <AlbumsManager albums={albums} />
    </div>
  );
}
