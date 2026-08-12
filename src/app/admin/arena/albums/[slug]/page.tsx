import { notFound } from "next/navigation";
import { AlbumPhotosManager } from "@/components/admin/AlbumPhotosManager";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const album = await prisma.photoAlbum.findUnique({ where: { slug } });
  return { title: album ? `Photos · ${album.guestName}` : "Album" };
}

export default async function AdminAlbumDetailPage({ params }: Props) {
  const { slug } = await params;
  const album = await prisma.photoAlbum.findUnique({
    where: { slug },
    include: {
      photos: {
        where: { kind: "IMAGE" },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!album) notFound();

  return <AlbumPhotosManager album={album} />;
}
