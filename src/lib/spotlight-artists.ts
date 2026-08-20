export type SpotlightArtistCard = {
  id?: string;
  name: string;
  role: string;
  image: string;
};

export function toSpotlightArtistCards(
  rows: Array<{ id?: string; name: string; role?: string | null; image?: string | null }>
): SpotlightArtistCard[] {
  return rows
    .map((row) => ({
      id: row.id,
      name: row.name.trim(),
      role: (row.role || "").trim() || "Artiste",
      image: (row.image || "").trim(),
    }))
    .filter((row) => row.name && row.image);
}
