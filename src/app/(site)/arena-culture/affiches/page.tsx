import { redirect } from "next/navigation";

/** Plus d’onglet Affiches : les visuels d’émission ne sont plus une page à part. */
export default function ArenaAffichesRedirect() {
  redirect("/arena-culture/emissions");
}
