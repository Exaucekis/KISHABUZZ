import { SessionProvider } from "next-auth/react";
import { connection } from "next/server";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { auth } from "@/lib/auth";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const [settings, session] = await Promise.all([getSettings(), auth()]);

  return (
    <>
      <OrganizationJsonLd settings={settings} />
      <SessionProvider>
        <ThemeProvider>
          <SiteHeader
            siteTitle={settings.siteTitle}
            user={
              session?.user
                ? { name: session.user.name ?? null, role: session.user.role }
                : null
            }
          />
          <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
          <SiteFooter />
        </ThemeProvider>
      </SessionProvider>
    </>
  );
}
