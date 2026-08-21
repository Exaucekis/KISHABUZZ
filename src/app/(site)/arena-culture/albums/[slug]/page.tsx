import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArenaAlbumViewer } from "@/components/arena/ArenaAlbumViewer";
import { ArenaPageIntro } from "@/components/arena/ArenaPageIntro";
import { getArenaPhotoAlbumBySlug } from "@/lib/data";
import { formatDate } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const album = await getArenaPhotoAlbumBySlug(slug);
  if (!album) return { title: "Album photo" };
  return {
    title: `${album.guestName} · Album Arena Culture`,
    description:
      album.description ||
      `Album photo Arena Grand Culture — invité : ${album.guestName}.`,
  };
}

export default async function ArenaAlbumPage({ params }: Props) {
  const { slug } = await params;
  const album = await getArenaPhotoAlbumBySlug(slug);
  if (!album) notFound();

  return (
    <>
      <ArenaPageIntro
        eyebrow={album.emissionLabel}
        title={album.guestName}
        description={
          album.description ||
          `Album photo du plateau — ${album.photos.length} cliché${album.photos.length > 1 ? "s" : ""}${
            album.date ? ` · ${formatDate(album.date)}` : ""
          }.`
        }
      />

      <section className="ac-page">
        <div className="mb-6">
          <Link href="/arena-culture/photos" className="text-sm font-semibold text-[var(--ac-amber)]">
            ← Galerie
          </Link>
        </div>

        <ArenaAlbumViewer
          guestName={album.guestName}
          emissionLabel={album.emissionLabel}
          photos={album.photos.map((p) => ({
            id: p.id,
            title: p.title,
            url: p.url,
            description: p.description,
          }))}
        />
      </section>
    </>
  );
}
