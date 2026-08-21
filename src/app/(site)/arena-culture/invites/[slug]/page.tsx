import { redirect } from "next/navigation";

/** Ancienne fiche publique → accueil Arena (bloc Prochain invité). */
export default function ArenaInviteDetailRedirect() {
  redirect("/arena-culture");
}
