export type SpotlightArtistCard = {
  id?: string;
  slug: string;
  name: string;
  role: string;
  image: string;
  likes: number;
  liked: boolean;
};

export function toSpotlightArtistCards(
  rows: Array<{
    id?: string;
    slug?: string | null;
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
      slug: (row.slug || "").trim(),
      name: row.name.trim(),
      role: (row.role || "").trim() || "Artiste",
      image: (row.image || "").trim(),
      likes: row._count?.likes || 0,
      liked: Boolean(row.liked),
    }))
    .filter((row) => row.name && row.image && row.slug);
}
