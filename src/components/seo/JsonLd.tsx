import { absoluteUrl } from "@/lib/utils";

type SettingsLike = {
  siteTitle: string;
  metaDescription: string;
  phone: string;
  email?: string;
  socialFacebook?: string;
  socialInstagram?: string;
  socialYoutube?: string;
  socialX?: string;
  socialTiktok?: string;
};

export function OrganizationJsonLd({ settings }: { settings: SettingsLike }) {
  const sameAs = [
    settings.socialFacebook,
    settings.socialInstagram,
    settings.socialYoutube,
    settings.socialX,
    settings.socialTiktok,
  ].filter(Boolean);

  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.siteTitle,
    url: absoluteUrl("/"),
    description: settings.metaDescription,
    telephone: settings.phone,
    ...(settings.email ? { email: settings.email } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ArticleJsonLd({
  title,
  description,
  url,
  image,
  datePublished,
  authorName,
}: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string | Date | null;
  authorName?: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    mainEntityOfPage: absoluteUrl(url),
    ...(image ? { image } : {}),
    ...(datePublished
      ? { datePublished: new Date(datePublished).toISOString() }
      : {}),
    author: {
      "@type": "Person",
      name: authorName || "KISHA BUZZ",
    },
    publisher: {
      "@type": "Organization",
      name: "KISHA BUZZ",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
