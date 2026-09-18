import assert from "node:assert/strict";
import test from "node:test";
import type { CatalogProduct } from "@/lib/catalog/types";
import { clusterProductsByCity, sizeBandFromCount } from "./cluster";

function product(
  overrides: Partial<CatalogProduct> & Pick<CatalogProduct, "slug" | "name">,
): CatalogProduct {
  return {
    id: overrides.slug,
    tagline: "Test",
    description: null,
    seoTitle: null,
    seoDescription: null,
    categorySlug: "tools",
    categoryName: "Інструменти",
    platforms: ["web"],
    website: "https://example.com",
    domain: "example.com",
    initials: "Te",
    surface: "surface",
    badge: null,
    sourceType: "editorial",
    claimable: false,
    pricingModel: null,
    hasUkrainianUi: null,
    cityLabel: null,
    ukraineNote: null,
    sameAs: [],
    lastVerifiedAt: null,
    publishedAt: null,
    listingTier: "free",
    extraLinks: [],
    creatorName: null,
    creatorLinkedInUrl: null,
    promoCode: null,
    promoUrl: null,
    relatedSlugs: [],
    ...overrides,
  };
}

test("size band depends on count only", () => {
  assert.equal(sizeBandFromCount(1), 1);
  assert.equal(sizeBandFromCount(2), 2);
  assert.equal(sizeBandFromCount(5), 3);
});

test("clusterProductsByCity groups known cities and keeps unlocated", () => {
  const { clusters, unlocated } = clusterProductsByCity([
    product({ slug: "a", name: "A", cityLabel: "Київ" }),
    product({ slug: "b", name: "B", cityLabel: "Kyiv" }),
    product({ slug: "c", name: "C", cityLabel: "Львів" }),
    product({ slug: "d", name: "D", cityLabel: null }),
  ]);

  assert.equal(clusters.length, 2);
  assert.equal(clusters[0]?.city.slug, "kyiv");
  assert.equal(clusters[0]?.products.length, 2);
  assert.equal(clusters[0]?.sizeBand, 2);
  assert.equal(clusters[1]?.city.slug, "lviv");
  assert.equal(unlocated.length, 1);
  assert.equal(unlocated[0].slug, "d");
});
