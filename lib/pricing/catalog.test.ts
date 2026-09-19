import assert from "node:assert/strict";
import test from "node:test";
import {
  BASE_LISTING_PRICE_UAH,
  listingTierPriceUah,
  PASSPORT_LISTING_SKU,
  PLACEMENT_SKUS,
} from "./catalog";
import { PASSPORT_LISTING_PRICE_UAH } from "@/lib/catalog/listing-tier";

test("free base and passport 300", () => {
  assert.equal(BASE_LISTING_PRICE_UAH, 0);
  assert.equal(PASSPORT_LISTING_PRICE_UAH, 300);
  assert.equal(listingTierPriceUah("free"), 0);
  assert.equal(listingTierPriceUah("passport"), 300);
  assert.equal(PASSPORT_LISTING_SKU.priceUah, 300);
});

test("category sponsor is exclusive", () => {
  const category = PLACEMENT_SKUS.find((s) => s.id === "catalog_category")!;
  assert.equal(category.maxConcurrent, 1);
});

test("placements are 30-day only", () => {
  for (const sku of PLACEMENT_SKUS) {
    assert.equal(Object.keys(sku.pricesUah).join(","), "30");
    assert.ok(sku.pricesUah[30]! > 0);
  }
});

test("map marker tiers: logo cap 25, large cap 5", () => {
  const logo = PLACEMENT_SKUS.find((s) => s.id === "map_logo")!;
  const large = PLACEMENT_SKUS.find((s) => s.id === "map_highlight")!;
  assert.equal(logo.maxConcurrent, 25);
  assert.equal(logo.pricesUah[30], 490);
  assert.equal(large.maxConcurrent, 5);
  assert.equal(large.pricesUah[30], 990);
});
