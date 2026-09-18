import type { CatalogProduct } from "@/lib/catalog/types";

/**
 * Apply live catalog placements. Product of the Day stays editorial-only
 * and is never overwritten by a paid placement badge.
 */
export function applyActivePlacements(
  products: CatalogProduct[],
  promotedSlugs: Set<string>,
): CatalogProduct[] {
  if (promotedSlugs.size === 0) return products;

  return products.map((product) => {
    if (!promotedSlugs.has(product.slug)) return product;
    if (product.badge === "product-of-the-day") return product;
    return { ...product, badge: "promoted" as const };
  });
}
