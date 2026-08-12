import { redirect } from "next/navigation";

/** Les photos sont uniquement dans Arena Culture */
export default function GalerieRedirectPage() {
  redirect("/arena-culture/photos");
}
