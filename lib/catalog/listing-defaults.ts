import type { CatalogProduct, ProductExtraLink } from "@/lib/catalog/types";

export const EMPTY_LISTING_FIELDS = {
  listingTier: "free" as const,
  extraLinks: [] as ProductExtraLink[],
  creatorName: null as string | null,
  creatorLinkedInUrl: null as string | null,
  promoCode: null as string | null,
  promoUrl: null as string | null,
  relatedSlugs: [] as string[],
};

/** Fill freemium fields for older fixtures / DB rows. */
export function withListingFields<T extends Partial<CatalogProduct>>(
  product: T,
): T & typeof EMPTY_LISTING_FIELDS {
  return {
    ...EMPTY_LISTING_FIELDS,
    ...product,
    listingTier: product.listingTier ?? "free",
    extraLinks: product.extraLinks ?? [],
    creatorName: product.creatorName ?? null,
    creatorLinkedInUrl: product.creatorLinkedInUrl ?? null,
    promoCode: product.promoCode ?? null,
    promoUrl: product.promoUrl ?? null,
    relatedSlugs: product.relatedSlugs ?? [],
  };
}
