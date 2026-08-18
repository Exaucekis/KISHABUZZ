export type SpotlightArtistCard = {
  name: string;
  role: string;
  image: string;
};

export function toSpotlightArtistCards(
  rows: Array<{ name: string; role?: string | null; image?: string | null }>
): SpotlightArtistCard[] {
  return rows
    .map((row) => ({
      name: row.name.trim(),
      role: (row.role || "").trim() || "Artiste",
      image: (row.image || "").trim(),
    }))
    .filter((row) => row.name && row.image);
}
