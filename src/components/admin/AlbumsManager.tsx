"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { deletePhotoAlbum, reorderPhotoAlbums } from "@/actions/admin/albums";
import { QuickPhotoForm } from "@/components/admin/QuickPhotoForm";
import { SortableOrderList } from "@/components/admin/SortableOrderList";

type Album = {
  id: string;
  guestName: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  emissionLabel: string;
  date: Date | null;
  visible: boolean;
  order: number;
  _count?: { photos: number };
};

export function AlbumsManager({
  albums,
  guestNames = [],
}: {
  albums: Album[];
  guestNames?: string[];
}) {
  const router = useRouter();
  const names = [...new Set([...guestNames, ...albums.map((album) => album.guestName)])];

  return (
    <div className="space-y-6">
      <QuickPhotoForm guests={names} />
      {albums.length > 1 ? (
        <SortableOrderList
          items={albums.map((a) => ({
            id: a.id,
            label: a.guestName,
            hint: `${a._count?.photos ?? 0} photo(s) · ${a.visible ? "Visible" : "Masqué"}`,
          }))}
          onReorder={reorderPhotoAlbums}
        />
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        {albums.map((a) => (
          <div key={a.id} className="admin-card flex gap-3">
            {a.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.coverImage} alt="" className="h-16 w-14 shrink-0 rounded object-cover" />
            ) : (
              <div className="grid h-16 w-14 shrink-0 place-items-center rounded bg-black/30 text-[10px] text-[#9aa3b5]">
                —
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{a.guestName}</p>
              <p className="text-sm text-[#9aa3b5]">
                {a._count?.photos ?? 0} photo{a._count?.photos === 1 ? "" : "s"}
                {a.visible ? "" : " · Masqué"}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link href={`/admin/arena/albums/${a.slug}`} className="admin-btn admin-btn-ghost text-xs">
                  Voir les photos
                </Link>
                <a
                  href={`/arena-culture/albums/${a.slug}`}
                  className="admin-btn admin-btn-ghost text-xs"
                  target="_blank"
                  rel="noreferrer"
                >
                  Voir en ligne
                </a>
                <form
                  action={async (formData) => {
                    await deletePhotoAlbum(formData);
                    router.refresh();
                  }}
                >
                  <input type="hidden" name="id" value={a.id} />
                  <button type="submit" className="admin-btn admin-btn-danger text-xs">
                    Suppr.
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
        {!albums.length ? (
          <p className="text-sm text-[#9aa3b5] sm:col-span-2">
            Aucun album. Publiez une photo ci-dessus : l’album de l’invité se crée tout seul.
          </p>
        ) : null}
      </div>
    </div>
  );
}
