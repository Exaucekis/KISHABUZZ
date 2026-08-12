import { redirect } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

/** Ancienne URL → nouveau chemin albums */
export default async function LegacyAlbumRedirect({ params }: Props) {
  const { slug } = await params;
  redirect(`/arena-culture/albums/${slug}`);
}
