import { AlbumsManager } from "@/components/admin/AlbumsManager";
import { ArenaAdminNav } from "@/components/admin/ArenaAdminNav";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Galerie Arena" };

export default async function AdminArenaAlbumsPage() {
  const [albums, guests] = await Promise.all([
    prisma.photoAlbum.findMany({
      include: { _count: { select: { photos: true } } },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
    prisma.arenaGuest.findMany({
      where: { visible: true },
      select: { name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <AdminPageIntro
        title="Galerie Arena"
        hint="Invité + photo. L’album se crée tout seul et la photo est en ligne sur Arena → Galerie, et sur l’accueil KISHA."
        actions={[
          {
            href: "/arena-culture/photos",
            label: "Voir la galerie",
            hint: "Ouvre la page publique",
            target: "_blank",
          },
        ]}
      />
      <ArenaAdminNav current="/admin/arena/albums" />
      <AlbumsManager albums={albums} guestNames={guests.map((guest) => guest.name)} />
    </div>
  );
}
