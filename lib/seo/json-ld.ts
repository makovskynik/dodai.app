import { ORGANIZATION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/seo/constants";
import { absoluteUrl } from "@/lib/seo/metadata";
import type { CatalogProduct } from "@/lib/catalog/types";

type JsonLd = Record<string, unknown>;

export function jsonLdScript(data: JsonLd | JsonLd[]) {
  return {
    __html: JSON.stringify(data),
  };
}

export function organizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ORGANIZATION.name,
    alternateName: ORGANIZATION.alternateName,
    url: ORGANIZATION.url,
    description: ORGANIZATION.description,
    areaServed: {
      "@type": "Country",
      name: "Ukraine",
    },
  };
}

export function websiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_TAGLINE,
    inLanguage: "uk-UA",
    publisher: {
      "@type": "Organization",
      name: ORGANIZATION.name,
      url: ORGANIZATION.url,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/products?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function productJsonLd(product: CatalogProduct): JsonLd {
  const isApp = product.platforms.some((platform) =>
    ["ios", "android", "macos", "app"].includes(platform),
  );

  return {
    "@context": "https://schema.org",
    "@type": isApp ? "SoftwareApplication" : "WebApplication",
    name: product.name,
    description: product.tagline,
    url: absoluteUrl(`/products/${product.slug}`),
    applicationCategory: product.categoryName,
    operatingSystem: product.platforms.join(", "),
    inLanguage: "uk",
    offers: product.pricingModel
      ? {
          "@type": "Offer",
          price: "0",
          priceCurrency: "UAH",
          description: product.pricingModel,
        }
      : undefined,
    sameAs: product.sameAs?.length ? product.sameAs : [product.website],
    dateModified: product.lastVerifiedAt ?? product.publishedAt ?? undefined,
    provider: {
      "@type": "Organization",
      name: product.name,
      url: product.website,
    },
  };
}

export function itemListJsonLd(
  products: CatalogProduct[],
  listName: string,
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    itemListOrder: "https://schema.org/ItemListUnordered",
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/products/${product.slug}`),
      name: product.name,
      description: product.tagline,
    })),
  };
}

export function faqJsonLd(
  items: Array<{ question: string; answer: string }>,
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
