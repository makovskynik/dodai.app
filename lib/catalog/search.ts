import type {
  CatalogProduct,
  CatalogQuery,
  CatalogResult,
} from "@/lib/catalog/types";
import {
  listLocalCategories,
  listLocalPlatforms,
  localCatalogProducts,
  EDITORIAL_DAY,
} from "@/lib/catalog/local-seed";
import { listFacetPlatforms } from "@/lib/catalog/platforms";
import { applyActivePlacements } from "@/lib/placements/apply";
import { listActiveCatalogProductSlugs } from "@/lib/placements/inventory";
import { LOCAL_DEMO_PLACEMENTS } from "@/lib/placements/local-inventory";
import { applyProductOfTheDayAward } from "@/lib/votes/apply";
import { getLocalAwards, getLocalLaunches } from "@/lib/votes/local-store";
import type { AwardRecord, LaunchRecord } from "@/lib/votes/rules";

function matchesQuery(product: CatalogProduct, q: string): boolean {
  const haystack = [
    product.name,
    product.tagline,
    product.description ?? "",
    product.categoryName,
    product.platforms.join(" "),
    product.domain ?? "",
    product.cityLabel ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => haystack.includes(token));
}

export function filterCatalog(
  products: CatalogProduct[],
  query: CatalogQuery,
): CatalogProduct[] {
  let result = [...products];

  if (query.q?.trim()) {
    result = result.filter((product) => matchesQuery(product, query.q!.trim()));
  }

  if (query.category) {
    result = result.filter((product) => product.categorySlug === query.category);
  }

  if (query.platform) {
    result = result.filter((product) =>
      product.platforms.includes(query.platform!),
    );
  }

  if (query.sort === "name") {
    result.sort((a, b) => a.name.localeCompare(b.name, "uk"));
  } else {
    result.sort((a, b) => {
      const aTime = a.publishedAt ? Date.parse(a.publishedAt) : 0;
      const bTime = b.publishedAt ? Date.parse(b.publishedAt) : 0;
      return bTime - aTime;
    });
  }

  return result;
}

function withLaunchMeta(
  products: CatalogProduct[],
  launches: LaunchRecord[],
): CatalogProduct[] {
  const bySlug = new Map(
    launches
      .filter((launch) => launch.status === "open")
      .map((launch) => [launch.productSlug, launch]),
  );
  return products.map((product) => {
    const launch = bySlug.get(product.slug);
    if (!launch) {
      return {
        ...product,
        activeLaunchId: product.activeLaunchId ?? null,
        voteCount: product.voteCount ?? 0,
      };
    }
    return {
      ...product,
      activeLaunchId: launch.id,
      voteCount: launch.voteCount,
    };
  });
}

export function buildCatalogResult(
  products: CatalogProduct[],
  query: CatalogQuery,
  options?: {
    promotedSlugs?: Set<string>;
    awards?: AwardRecord[];
    launches?: LaunchRecord[];
  },
): CatalogResult {
  const promotedSlugs =
    options?.promotedSlugs ??
    listActiveCatalogProductSlugs(LOCAL_DEMO_PLACEMENTS);
  const awards = options?.awards ?? getLocalAwards();
  const launches = options?.launches ?? getLocalLaunches();

  const withPlacements = applyActivePlacements(products, promotedSlugs);
  const withAwards = applyProductOfTheDayAward(withPlacements, awards);
  const withVotes = withLaunchMeta(withAwards, launches);

  const filtered = filterCatalog(withVotes, query);
  const organic = filtered.filter((product) => product.badge !== "promoted");
  const promoted = filtered.filter((product) => product.badge === "promoted");

  // Facet counts follow the current query, excluding the facet's own dimension.
  const categoryUniverse = filterCatalog(withVotes, {
    q: query.q,
    platform: query.platform,
    sort: query.sort,
  });
  const platformUniverse = filterCatalog(withVotes, {
    q: query.q,
    category: query.category,
    sort: query.sort,
  });

  const categories = listLocalCategories(categoryUniverse).filter(
    (category) => category.count > 0 || category.slug === query.category,
  );
  const platforms = listFacetPlatforms(listLocalPlatforms(platformUniverse));

  return {
    organic,
    promoted,
    categories,
    platforms,
    total: filtered.length,
    query,
    zeroResult: filtered.length === 0,
  };
}

export function getLocalCatalog(query: CatalogQuery = {}): CatalogResult {
  return buildCatalogResult(localCatalogProducts, query);
}

export function getLocalProductBySlug(
  slug: string,
): CatalogProduct | undefined {
  return localCatalogProducts.find((product) => product.slug === slug);
}

export function getLocalProductOfTheDay(): CatalogProduct | undefined {
  const catalog = buildCatalogResult(localCatalogProducts, {});
  return (
    catalog.organic.find((product) => product.badge === "product-of-the-day") ??
    localCatalogProducts.find((product) => product.slug === EDITORIAL_DAY)
  );
}
