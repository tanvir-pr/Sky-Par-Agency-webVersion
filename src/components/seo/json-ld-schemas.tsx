import { SITE_CONFIG } from "@/lib/constants";
import { getSiteUrl } from "@/lib/seo";
import type { SeoSettingsSnapshot } from "@/lib/seo";

function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

function socialLinks(settings: SeoSettingsSnapshot): string[] {
  return [
    settings.socialLinkedin,
    settings.socialTwitter,
    settings.socialFacebook,
    settings.socialInstagram,
    settings.socialYoutube,
  ].filter((url): url is string => Boolean(url));
}

const baseUrl = () => getSiteUrl();

export function OrganizationJsonLd({ settings }: { settings: SeoSettingsSnapshot }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.companyName,
    description: settings.tagline || SITE_CONFIG.description,
    url: baseUrl(),
    email: settings.email || SITE_CONFIG.email,
    telephone: settings.phone || SITE_CONFIG.phone,
    address: settings.address
      ? { "@type": "PostalAddress", streetAddress: settings.address }
      : undefined,
    sameAs: socialLinks(settings),
  };
  return <JsonLdScript data={data} />;
}

export function LocalBusinessJsonLd({ settings }: { settings: SeoSettingsSnapshot }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: settings.companyName,
    description: settings.tagline || SITE_CONFIG.description,
    url: baseUrl(),
    email: settings.email || SITE_CONFIG.email,
    telephone: settings.phone || SITE_CONFIG.phone,
    priceRange: "$$",
    address: settings.address
      ? { "@type": "PostalAddress", streetAddress: settings.address }
      : undefined,
    sameAs: socialLinks(settings),
  };
  return <JsonLdScript data={data} />;
}

export function WebSiteJsonLd({ settings }: { settings: SeoSettingsSnapshot }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.companyName,
    url: baseUrl(),
    description: settings.tagline || SITE_CONFIG.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl()}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
  return <JsonLdScript data={data} />;
}

export function FaqJsonLd({ items }: { items: { question: string; answer: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
  return <JsonLdScript data={data} />;
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl()}${item.path.startsWith("/") ? item.path : `/${item.path}`}`,
    })),
  };
  return <JsonLdScript data={data} />;
}

export function ServiceJsonLd({
  name,
  description,
  slug,
  offers,
}: {
  name: string;
  description: string;
  slug: string;
  offers?: { name: string; price: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    provider: { "@type": "Organization", name: SITE_CONFIG.name, url: baseUrl() },
    url: `${baseUrl()}/services/${slug}`,
    areaServed: "Worldwide",
    hasOfferCatalog: offers?.length
      ? {
          "@type": "OfferCatalog",
          name: `${name} Pricing`,
          itemListElement: offers.map((offer) => ({
            "@type": "Offer",
            name: offer.name,
            price: offer.price,
            priceCurrency: "USD",
          })),
        }
      : undefined,
  };
  return <JsonLdScript data={data} />;
}

export function ArticleJsonLd({
  title,
  description,
  slug,
  image,
  datePublished,
  dateModified,
  authorName,
}: {
  title: string;
  description: string;
  slug: string;
  image?: string | null;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: image ? [image] : undefined,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Person",
      name: authorName || SITE_CONFIG.name,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: baseUrl(),
    },
    mainEntityOfPage: `${baseUrl()}/blog/${slug}`,
  };
  return <JsonLdScript data={data} />;
}

export function CreativeWorkJsonLd({
  title,
  description,
  slug,
  image,
  category,
}: {
  title: string;
  description: string;
  slug: string;
  image: string;
  category?: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: title,
    description,
    image,
    genre: category,
    url: `${baseUrl()}/portfolio/${slug}`,
    creator: { "@type": "Organization", name: SITE_CONFIG.name },
  };
  return <JsonLdScript data={data} />;
}
