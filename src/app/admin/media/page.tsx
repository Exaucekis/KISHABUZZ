import { MediaManager } from "@/components/admin/MediaManager";
import { AdminPageIntro } from "@/components/admin/AdminHint";
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
      <AdminPageIntro
        title="Médias / Galerie"
        hint="Ajoutez une photo ou une vidéo : fichier, ou lien YouTube / Instagram / Facebook / TikTok. Catégorie « Arena Culture » pour les pages Arena."
      />
      <MediaManager items={items} />
    </div>
  );
}
