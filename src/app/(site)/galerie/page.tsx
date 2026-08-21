import { redirect } from "next/navigation";

/** La galerie photos vit dans Arena Culture */
export default function GalerieRedirectPage() {
  redirect("/arena-culture/photos");
}
