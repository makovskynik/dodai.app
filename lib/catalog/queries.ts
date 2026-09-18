import {
  buildCatalogResult,
  getLocalProductBySlug,
  getLocalProductOfTheDay,
} from "@/lib/catalog/search";
import { localCatalogProducts } from "@/lib/catalog/local-seed";
import { logoUrlForSlug } from "@/lib/catalog/logos";
import type {
  CatalogProduct,
  CatalogQuery,
  CatalogResult,
  ProductSurface,
} from "@/lib/catalog/types";
import { createDb } from "@/server/db/client";
import { categories, productLinks, products } from "@/server/db/schema";
import { listPublishedProducts } from "@/server/catalog/published-store";
import { getActiveCatalogPlacementSlugs } from "@/server/placements/queries";
import { listAwards, listLaunches } from "@/server/votes/service";
import { recordZeroResult } from "@/server/geo/zero-results";
import type { AwardRecord, LaunchRecord } from "@/lib/votes/rules";
import { and, desc, eq } from "drizzle-orm";
import { hasDatabase } from "@/lib/env";
import { CATEGORY_OPTIONS } from "@/lib/submit/schema";

async function catalogEnrichment(): Promise<{
  promotedSlugs: Set<string>;
  awards: AwardRecord[];
  launches: LaunchRecord[];
}> {
  const [promotedSlugs, awards, launches] = await Promise.all([
    getActiveCatalogPlacementSlugs(),
    listAwards(),
    listLaunches(),
  ]);
  return { promotedSlugs, awards, launches };
}

async function withPublishedOverlay(
  base: CatalogProduct[],
): Promise<CatalogProduct[]> {
  const published = await listPublishedProducts();
  if (!published.length) return base;

  const byDomain = new Map(
    base.map((product) => [product.domain?.toLowerCase() ?? product.slug, product]),
  );
  for (const product of published) {
    const key = product.domain?.toLowerCase() ?? product.slug;
    byDomain.set(key, {
      ...product,
      categoryName:
        CATEGORY_OPTIONS.find((item) => item.slug === product.categorySlug)
          ?.nameUk ?? product.categoryName,
    });
  }
  return [...byDomain.values()];
}

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  domain: string | null;
  platforms: string[] | null;
  surface: string;
  sourceType: "owner" | "editorial";
  claimable: boolean;
  pricingModel: string | null;
  hasUkrainianUi: boolean | null;
  cityLabel: string | null;
  ukraineNote: string | null;
  sameAs: string[] | null;
  lastVerifiedAt: Date | null;
  publishedAt: Date | null;
  categorySlug: string | null;
  categoryName: string | null;
  website: string | null;
};

function toCatalogProduct(
  row: ProductRow,
  badge: CatalogProduct["badge"] = null,
): CatalogProduct {
  const name = row.name;
  const initials = name
    .replace(/[.:]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2);

  return {
    id: row.id,
    slug: row.slug,
    name,
    tagline: row.tagline,
    description: row.description,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    categorySlug: row.categorySlug ?? "tools",
    categoryName: row.categoryName ?? "Інструменти",
    platforms: row.platforms ?? ["web"],
    website: row.website ?? "#",
    domain: row.domain,
    initials: initials || "d+",
    logoUrl: logoUrlForSlug(row.slug),
    surface: (row.surface as ProductSurface) || "surface",
    badge,
    sourceType: row.sourceType,
    claimable: row.claimable,
    pricingModel: row.pricingModel,
    hasUkrainianUi: row.hasUkrainianUi,
    cityLabel: row.cityLabel,
    ukraineNote: row.ukraineNote,
    sameAs: row.sameAs ?? [],
    lastVerifiedAt: row.lastVerifiedAt?.toISOString() ?? null,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    listingTier: "free",
    extraLinks: [],
    creatorName: null,
    creatorLinkedInUrl: null,
    promoCode: null,
    promoUrl: null,
    relatedSlugs: [],
  };
}

const productSelect = {
  id: products.id,
  slug: products.slug,
  name: products.name,
  tagline: products.tagline,
  description: products.description,
  seoTitle: products.seoTitle,
  seoDescription: products.seoDescription,
  domain: products.domain,
  platforms: products.platforms,
  surface: products.surface,
  sourceType: products.sourceType,
  claimable: products.claimable,
  pricingModel: products.pricingModel,
  hasUkrainianUi: products.hasUkrainianUi,
  cityLabel: products.cityLabel,
  ukraineNote: products.ukraineNote,
  sameAs: products.sameAs,
  lastVerifiedAt: products.lastVerifiedAt,
  publishedAt: products.publishedAt,
  categorySlug: categories.slug,
  categoryName: categories.nameUk,
  website: productLinks.url,
};

function resolveWithPlacements(
  product: CatalogProduct,
  promotedSlugs: Set<string>,
  awards?: AwardRecord[],
  launches?: LaunchRecord[],
): CatalogProduct {
  const result = buildCatalogResult([product], {}, {
    promotedSlugs,
    awards,
    launches,
  });
  return result.promoted[0] ?? result.organic[0] ?? product;
}

async function getDbCatalog(query: CatalogQuery): Promise<CatalogResult> {
  const db = createDb();
  const enrichment = await catalogEnrichment();

  const rows = await db
    .select(productSelect)
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(
      productLinks,
      and(
        eq(productLinks.productId, products.id),
        eq(productLinks.isPrimary, true),
      ),
    )
    .where(eq(products.status, "active"))
    .orderBy(desc(products.publishedAt), products.name);

  const mapped = rows.map((row) => toCatalogProduct(row));
  return buildCatalogResult(mapped, query, enrichment);
}

async function getDbProductBySlug(
  slug: string,
): Promise<CatalogProduct | undefined> {
  const db = createDb();
  const enrichment = await catalogEnrichment();
  const rows = await db
    .select(productSelect)
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(
      productLinks,
      and(
        eq(productLinks.productId, products.id),
        eq(productLinks.isPrimary, true),
      ),
    )
    .where(and(eq(products.slug, slug), eq(products.status, "active")))
    .limit(1);

  const row = rows[0];
  if (!row) return undefined;
  return resolveWithPlacements(
    toCatalogProduct(row),
    enrichment.promotedSlugs,
    enrichment.awards,
    enrichment.launches,
  );
}

export async function getCatalog(
  query: CatalogQuery = {},
): Promise<CatalogResult> {
  if (!hasDatabase()) {
    const merged = await withPublishedOverlay(localCatalogProducts);
    const enrichment = await catalogEnrichment();
    return buildCatalogResult(merged, query, enrichment);
  }

  try {
    const dbCatalog = await getDbCatalog(query);
    const merged = await withPublishedOverlay([
      ...dbCatalog.organic,
      ...dbCatalog.promoted,
    ]);
    const enrichment = await catalogEnrichment();
    return buildCatalogResult(merged, query, enrichment);
  } catch (error) {
    console.error("Catalog DB query failed, falling back to local seed", error);
    const merged = await withPublishedOverlay(localCatalogProducts);
    const enrichment = await catalogEnrichment();
    return buildCatalogResult(merged, query, enrichment);
  }
}

export async function getProductBySlug(
  slug: string,
): Promise<CatalogProduct | undefined> {
  const published = await listPublishedProducts();
  const fromPublished = published.find((product) => product.slug === slug);
  if (fromPublished) {
    const enrichment = await catalogEnrichment();
    return resolveWithPlacements(
      {
        ...fromPublished,
        categoryName:
          CATEGORY_OPTIONS.find(
            (item) => item.slug === fromPublished.categorySlug,
          )?.nameUk ?? fromPublished.categoryName,
      },
      enrichment.promotedSlugs,
      enrichment.awards,
      enrichment.launches,
    );
  }

  if (!hasDatabase()) {
    const enrichment = await catalogEnrichment();
    const local = getLocalProductBySlug(slug);
    if (!local) return undefined;
    return resolveWithPlacements(
      local,
      enrichment.promotedSlugs,
      enrichment.awards,
      enrichment.launches,
    );
  }

  try {
    return (await getDbProductBySlug(slug)) ?? getLocalProductBySlug(slug);
  } catch (error) {
    console.error("Product DB query failed, falling back to local seed", error);
    return getLocalProductBySlug(slug);
  }
}

export async function getProductOfTheDay(): Promise<CatalogProduct | undefined> {
  const catalog = await getCatalog({});
  return (
    catalog.organic.find((product) => product.badge === "product-of-the-day") ??
    getLocalProductOfTheDay()
  );
}

export async function recordZeroResultSearch(query: CatalogQuery): Promise<void> {
  await recordZeroResult(query);
}
