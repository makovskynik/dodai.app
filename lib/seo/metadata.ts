import type { Metadata } from "next";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/seo/constants";

type BuildMetadataInput = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  type?: "website" | "article";
};

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function buildPageMetadata({
  title,
  description,
  path = "/",
  image = "/og-default.png",
  noIndex = false,
  type = "website",
}: BuildMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = title.includes(SITE_NAME) ? title : undefined;

  return {
    title: fullTitle ?? title,
    description,
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true },
    openGraph: {
      type,
      locale: "uk_UA",
      url,
      siteName: SITE_NAME,
      title: fullTitle ?? `${title} · ${SITE_NAME}`,
      description,
      images: [
        {
          url: absoluteUrl(image),
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle ?? `${title} · ${SITE_NAME}`,
      description,
      images: [absoluteUrl(image)],
    },
  };
}

export function homeMetadata(): Metadata {
  return buildPageMetadata({
    title: `${SITE_NAME} — українські цифрові продукти`,
    description: SITE_TAGLINE,
    path: "/",
  });
}
