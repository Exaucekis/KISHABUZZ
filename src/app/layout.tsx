import type { Metadata } from "next";
import { Figtree, Newsreader, Syne } from "next/font/google";
import { getSettings } from "@/lib/data";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
  preload: true,
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  preload: true,
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
  adjustFontFallback: true,
});

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    title: {
      default: settings.metaTitle || settings.siteTitle,
      template: `%s · ${settings.siteTitle}`,
    },
    description: settings.metaDescription,
    icons: {
      icon: "/brand/kisha-buzz-icon.png",
      apple: "/brand/kisha-buzz-icon.png",
    },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      siteName: settings.siteTitle,
      title: settings.metaTitle || settings.siteTitle,
      description: settings.metaDescription,
      images: [{ url: "/brand/kisha-buzz-logo.png", width: 512, height: 512, alt: "KISHA BUZZ" }],
    },
    twitter: {
      card: "summary",
      title: settings.metaTitle || settings.siteTitle,
      description: settings.metaDescription,
      images: ["/brand/kisha-buzz-logo.png"],
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${syne.variable} ${figtree.variable} ${newsreader.variable} dark h-full antialiased`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-ink text-paper">{children}</body>
    </html>
  );
}
