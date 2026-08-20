import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kisha-buzz.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/compte", "/paiement", "/s", "/scan", "/organisateur"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
