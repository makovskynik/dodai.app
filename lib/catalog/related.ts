import type { CatalogProduct } from "@/lib/catalog/types";

/** Auto-similar: same category, exclude self and already-listed related. */
export function findSimilarProducts(
  product: CatalogProduct,
  catalog: CatalogProduct[],
  limit = 4,
): CatalogProduct[] {
  const exclude = new Set([product.slug, ...product.relatedSlugs]);
  return catalog
    .filter(
      (item) =>
        item.slug !== product.slug &&
        !exclude.has(item.slug) &&
        item.categorySlug === product.categorySlug &&
        item.badge !== "promoted",
    )
    .slice(0, limit);
}

export function resolveRelatedProducts(
  product: CatalogProduct,
  catalog: CatalogProduct[],
): CatalogProduct[] {
  if (product.listingTier !== "passport" || product.relatedSlugs.length === 0) {
    return [];
  }
  const bySlug = new Map(catalog.map((item) => [item.slug, item]));
  return product.relatedSlugs
    .map((slug) => bySlug.get(slug))
    .filter((item): item is CatalogProduct => Boolean(item));
}
