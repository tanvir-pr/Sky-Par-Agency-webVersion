import type { Metadata } from "next";
import { SITE_CONFIG } from "./constants";
import { getCachedSettings } from "./data";

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL || SITE_CONFIG.url;
  return url.replace(/\/$/, "");
}

export function getDefaultOgImage(): string {
  return `${getSiteUrl()}/opengraph-image`;
}

export function buildCanonical(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalized === "/" ? "" : normalized}`;
}

export interface PageSeoInput {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string | null;
  noIndex?: boolean;
  type?: "website" | "article";
}

export function buildPageMetadata(input: PageSeoInput): Metadata {
  const {
    title,
    description,
    path,
    keywords,
    image,
    noIndex = false,
    type = "website",
  } = input;

  const canonical = buildCanonical(path);
  const ogImage = image || getDefaultOgImage();

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      type,
      locale: "en_US",
      url: canonical,
      title,
      description,
      siteName: SITE_CONFIG.name,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true },
  };
}

export async function getRootMetadata(): Promise<Metadata> {
  let settings = null;
  try {
    settings = await getCachedSettings();
  } catch {
    settings = null;
  }

  const siteName = settings?.companyName || SITE_CONFIG.name;
  const title = settings?.seoTitle || `${siteName} | ${settings?.tagline || SITE_CONFIG.tagline}`;
  const description = settings?.seoDescription || SITE_CONFIG.description;
  const keywords = settings?.seoKeywords
    ? settings.seoKeywords.split(",").map((k) => k.trim()).filter(Boolean)
    : [
        "digital agency",
        "web development",
        "automation",
        "AI integrations",
        "digital marketing",
      ];

  const siteUrl = getSiteUrl();
  const ogImage = getDefaultOgImage();
  const googleVerification = process.env.GOOGLE_SITE_VERIFICATION;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
    description,
    keywords,
    authors: [{ name: siteName, url: siteUrl }],
    creator: siteName,
    publisher: siteName,
    formatDetection: { email: false, address: false, telephone: false },
    alternates: { canonical: siteUrl },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteUrl,
      siteName,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: googleVerification
      ? { google: googleVerification }
      : undefined,
  };
}

export interface SeoSettingsSnapshot {
  companyName: string;
  tagline: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  socialTwitter: string | null;
  socialLinkedin: string | null;
  socialInstagram: string | null;
  socialFacebook: string | null;
  socialYoutube: string | null;
}

export async function getSeoSettingsSnapshot(): Promise<SeoSettingsSnapshot> {
  try {
    const s = await getCachedSettings();
    return {
      companyName: s.companyName,
      tagline: s.tagline,
      email: s.email,
      phone: s.phone,
      address: s.address,
      socialTwitter: s.socialTwitter,
      socialLinkedin: s.socialLinkedin,
      socialInstagram: s.socialInstagram,
      socialFacebook: s.socialFacebook,
      socialYoutube: s.socialYoutube,
    };
  } catch {
    return {
      companyName: SITE_CONFIG.name,
      tagline: SITE_CONFIG.tagline,
      email: SITE_CONFIG.email,
      phone: SITE_CONFIG.phone,
      address: SITE_CONFIG.address,
      socialTwitter: null,
      socialLinkedin: null,
      socialInstagram: null,
      socialFacebook: null,
      socialYoutube: null,
    };
  }
}
