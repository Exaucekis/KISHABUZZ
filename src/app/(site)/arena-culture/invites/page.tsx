import { redirect } from "next/navigation";

/** Plus d’onglet Invités : la personne se voit dans Prochain invité. */
export default function ArenaInvitesRedirect() {
  redirect("/arena-culture");
}
