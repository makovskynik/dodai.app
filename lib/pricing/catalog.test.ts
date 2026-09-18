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

test("map highlight price is per product, inventory is five", () => {
  const map = PLACEMENT_SKUS.find((s) => s.id === "map_highlight")!;
  assert.equal(map.maxConcurrent, 5);
  assert.equal(map.pricesUah[30], 690);
  assert.match(map.summaryUk, /×3/);
});
