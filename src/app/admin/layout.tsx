import { SessionProvider } from "next-auth/react";
import { AdminShell } from "@/components/admin/AdminShell";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessAdmin } from "@/lib/roles";

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
  const notices =
    session?.user?.id && canAccessAdmin(session.user.role)
      ? await prisma.adminNotice.findMany({
          orderBy: { createdAt: "desc" },
          take: 12,
        })
      : [];

  return (
    <SessionProvider>
      <AdminShell
        role={session?.user?.role}
        userName={session?.user?.name}
        notices={notices.map((item) => ({
          id: item.id,
          title: item.title,
          body: item.body,
          href: item.href,
          read: item.read,
          createdAt: item.createdAt.toISOString(),
        }))}
      >
        {children}
      </AdminShell>
    </SessionProvider>
  );
}
