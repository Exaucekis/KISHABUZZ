import { redirect } from "next/navigation";

export default async function AdminLoginRedirect({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const next = new URLSearchParams();
  next.set("callbackUrl", params.callbackUrl || "/admin");
  redirect(`/connexion?${next.toString()}`);
}
