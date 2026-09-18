import logoManifest from "@/data/product-logos-manifest.json";

const bySlug = logoManifest as Record<string, string>;

/** Local path under /public for a product logo, if we fetched one. */
export function logoUrlForSlug(slug: string): string | null {
  return bySlug[slug] ?? null;
}

export function withProductLogoUrl<T extends { slug: string; logoUrl?: string | null }>(
  product: T,
): T & { logoUrl: string | null } {
  return {
    ...product,
    logoUrl: product.logoUrl ?? logoUrlForSlug(product.slug),
  };
}
