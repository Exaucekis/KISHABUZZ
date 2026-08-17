import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { auth } from "@/lib/auth";
import { getSettings } from "@/lib/data";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, session] = await Promise.all([getSettings(), auth()]);

  return (
    <ThemeProvider>
      <OrganizationJsonLd settings={settings} />
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
  );
}
