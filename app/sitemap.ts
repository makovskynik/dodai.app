import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/catalog/queries";
import { isCategoryIndexable } from "@/lib/geo/category-index";
import {
  EDITORIAL_COLLECTIONS,
  isCollectionIndexable,
  matchCollectionProducts,
} from "@/lib/geo/collections";
import { SITE_URL } from "@/lib/seo/constants";
import { listLocalCategories } from "@/lib/catalog/local-seed";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalog = await getCatalog({ sort: "name" });
  const products = [...catalog.organic, ...catalog.promoted];
  const categories = listLocalCategories(products).filter(isCategoryIndexable);

  const collections = EDITORIAL_COLLECTIONS.filter((collection) =>
    isCollectionIndexable(
      matchCollectionProducts(collection, products).length,
    ),
  );

  const now = new Date();

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/products`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/product-of-the-week`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/map`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/categories`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/collections`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: `${SITE_URL}/legal/offer`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/legal/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...categories.map((category) => ({
      url: `${SITE_URL}/categories/${category.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...collections.map((collection) => ({
      url: `${SITE_URL}/collections/${collection.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.72,
    })),
    ...products.map((product) => ({
      url: `${SITE_URL}/products/${product.slug}`,
      lastModified: product.lastVerifiedAt
        ? new Date(product.lastVerifiedAt)
        : product.publishedAt
          ? new Date(product.publishedAt)
          : now,
      changeFrequency: "weekly" as const,
      priority: product.badge === "product-of-the-day" ? 0.85 : 0.75,
    })),
  ];
}
