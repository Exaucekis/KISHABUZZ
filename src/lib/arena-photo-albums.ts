/**
 * @deprecated Les albums sont maintenant gérés en base via /admin/arena/albums
 * Fichier conservé temporairement pour éviter les imports cassés.
 */
export type ArenaPhotoAlbum = {
  slug: string;
  guestName: string;
  title: string;
  emissionLabel: string;
  description: string;
  coverImage: string;
  dateLabel?: string;
  photos: { id: string; title: string; url: string; description?: string }[];
};

export const arenaPhotoAlbums: ArenaPhotoAlbum[] = [];

export function getArenaPhotoAlbumsStatic() {
  return arenaPhotoAlbums;
}

export function getArenaPhotoAlbumBySlugStatic(_slug: string) {
  return null;
}
