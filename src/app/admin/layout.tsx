import { SessionProvider } from "next-auth/react";
import { AdminShell } from "@/components/admin/AdminShell";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <SessionProvider>
      <AdminShell role={session?.user?.role} userName={session?.user?.name}>
        {children}
      </AdminShell>
    </SessionProvider>
  );
}
