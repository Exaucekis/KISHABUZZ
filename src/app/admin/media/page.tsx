import { MediaManager } from "@/components/admin/MediaManager";
import { QuickPhotoForm } from "@/components/admin/QuickPhotoForm";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Médias" };

type Props = { searchParams: Promise<{ kind?: string }> };

export default async function AdminMediaPage({ searchParams }: Props) {
  const { kind } = await searchParams;
  const [items, albums, guests] = await Promise.all([
    prisma.mediaAsset.findMany({
      where: kind ? { kind } : undefined,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    prisma.photoAlbum.findMany({ select: { guestName: true } }),
    prisma.arenaGuest.findMany({
      where: { visible: true },
      select: { name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <AdminPageIntro
        title="Médias"
        hint="Pour une photo Arena : invité + fichier, c’est en ligne. Pour une vidéo Arena, ouvrez Arena → Émissions et publiez une nouvelle émission."
      />
      <QuickPhotoForm guests={[...albums.map((album) => album.guestName), ...guests.map((guest) => guest.name)]} />
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#9aa3b5]">
          Bibliothèque (vidéos et autres fichiers)
        </h2>
        <MediaManager items={items} />
      </div>
    </div>
  );
}
