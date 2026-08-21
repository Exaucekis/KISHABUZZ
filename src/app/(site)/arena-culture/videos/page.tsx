import { redirect } from "next/navigation";

/** Les vidéos se regardent dans Émissions. */
export default function ArenaVideosRedirectPage() {
  redirect("/arena-culture/emissions");
}
