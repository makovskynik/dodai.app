import assert from "node:assert/strict";
import test from "node:test";
import { isCategoryIndexable } from "./category-index";
import {
  matchCollectionProducts,
  suggestCollectionsForQuery,
  isCollectionIndexable,
} from "./collections";
import type { CatalogProduct } from "@/lib/catalog/types";

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

test("category needs intro and min count to index", () => {
  assert.equal(
    isCategoryIndexable({
      slug: "crm",
      nameUk: "CRM",
      count: 5,
      introUk: "Intro",
    }),
    true,
  );
  assert.equal(
    isCategoryIndexable({
      slug: "crm",
      nameUk: "CRM",
      count: 5,
      introUk: null,
    }),
    false,
  );
  assert.equal(
    isCategoryIndexable({
      slug: "crm",
      nameUk: "CRM",
      count: 1,
      introUk: "Intro",
    }),
    false,
  );
});

test("collections match by category and keywords", () => {
  const matched = matchCollectionProducts(
    {
      slug: "crm-dlya-fop",
      titleUk: "CRM",
      introUk: "x",
      seoTitle: "x",
      seoDescription: "x",
      taskQueryUk: "CRM",
      categorySlugs: ["crm"],
      keywords: ["crm"],
    },
    [
      product({ slug: "a", name: "A", categorySlug: "crm", categoryName: "CRM" }),
      product({ slug: "b", name: "B", categorySlug: "seo", categoryName: "SEO" }),
    ],
  );
  assert.equal(matched.length, 1);
  assert.equal(matched[0].slug, "a");
  assert.equal(isCollectionIndexable(3), true);
});

test("zero-result query suggests related collections", () => {
  const slugs = suggestCollectionsForQuery("crm для фоп");
  assert.ok(slugs.includes("crm-dlya-fop"));
});
