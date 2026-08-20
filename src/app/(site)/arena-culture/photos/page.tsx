import type { Metadata } from "next";
import Link from "next/link";
import { ArenaPageIntro } from "@/components/arena/ArenaPageIntro";
import { EmptyState } from "@/components/ui/EmptyState";
import { getArenaPhotoAlbums } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Photos · Arena Culture",
  description: "Albums photos Arena Grand Culture — un album par invité, dans l’ordre.",
};

export const dynamic = "force-dynamic";

export default async function ArenaPhotosPage() {
  const albums = (await getArenaPhotoAlbums()).filter(
    (album) => album.coverImage || album.photos[0]?.url
  );

  return (
    <>
      <ArenaPageIntro
        title="Photos"
        description="Un album par invité, classé dans l’ordre du plateau. Ouvre un album pour voir les photos."
      />

      <section className="ac-page">
        {albums.length ? (
          <div className="ac-albums">
            {albums.map((album) => {
              const cover = album.coverImage || album.photos[0]?.url || "";
              return (
                <Link
                  key={album.id}
                  href={`/arena-culture/albums/${album.slug}`}
                  className="ac-album-card focus-ring"
                >
                  <div className="ac-album-card__cover">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cover} alt="" loading="lazy" decoding="async" />
                    <span className="ac-album-card__badge">Ouvrir l&apos;album</span>
                  </div>
                  <div className="ac-album-card__body">
                    <p className="ac-kicker">{album.emissionLabel}</p>
                    <h2>{album.guestName || album.title}</h2>
                    <p>
                      {album.photos.length} photo{album.photos.length > 1 ? "s" : ""}
                      {album.date ? ` · ${formatDate(album.date)}` : ""}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Aucun album photo"
            description="Les albums seront publiés depuis l’administration (un album par invité)."
          />
        )}
      </section>
    </>
  );
}
