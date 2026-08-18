import { ArtistsManager } from "@/components/admin/ArtistsManager";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Artistes à la une" };

export default async function AdminArtistsPage() {
  const artists = await prisma.spotlightArtist.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
  return (
    <div>
      <AdminPageIntro
        title="Artistes à la une"
        hint="Ces portraits défilent sur l’accueil. Cochez Visible et donnez une photo. L’ordre : plus le chiffre est petit, plus l’artiste arrive tôt."
      />
      <ArtistsManager artists={artists} />
    </div>
  );
}
