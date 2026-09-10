export type SpotlightArtistCard = {
  id?: string;
  name: string;
  role: string;
  image: string;
  likes: number;
  liked: boolean;
};

export function toSpotlightArtistCards(
  rows: Array<{
    id?: string;
    name: string;
    role?: string | null;
    image?: string | null;
    _count?: { likes: number };
    liked?: boolean;
  }>
): SpotlightArtistCard[] {
  return rows
    .map((row) => ({
      id: row.id,
      name: row.name.trim(),
      role: (row.role || "").trim() || "Artiste",
      image: (row.image || "").trim(),
      likes: row._count?.likes || 0,
      liked: Boolean(row.liked),
    }))
    .filter((row) => row.name && row.image);
}
