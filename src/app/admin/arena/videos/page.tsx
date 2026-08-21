import { redirect } from "next/navigation";

/** Les vidéos se publient depuis Nouvelle émission. */
export default function AdminArenaVideosRedirectPage() {
  redirect("/admin/arena/emissions");
}
