import assert from "node:assert/strict";
import test from "node:test";
import { localCatalogProducts } from "./local-seed";
import { buildCatalogResult, filterCatalog } from "./search";

test("local seed has editorial products", () => {
  assert.ok(localCatalogProducts.length >= 20);
  assert.ok(localCatalogProducts.every((product) => product.tagline.length <= 120));
});

test("search finds task-oriented matches", () => {
  const result = filterCatalog(localCatalogProducts, { q: "crm" });
  assert.ok(result.some((product) => product.slug.includes("nethunt") || product.categorySlug === "crm"));
});

test("promoted stays separate from organic", () => {
  const catalog = buildCatalogResult(localCatalogProducts, {});
  assert.ok(catalog.promoted.every((product) => product.badge === "promoted"));
  assert.ok(catalog.organic.every((product) => product.badge !== "promoted"));
});

test("zero result is detected", () => {
  const catalog = buildCatalogResult(localCatalogProducts, {
    q: "zzz-no-such-product-xyz",
  });
  assert.equal(catalog.zeroResult, true);
  assert.equal(catalog.total, 0);
});

test("facets follow the search query and hide empty categories", () => {
  const catalog = buildCatalogResult(localCatalogProducts, { q: "SOM" });
  assert.equal(catalog.total, 1);
  assert.ok(catalog.categories.every((category) => category.count > 0));
  assert.ok(
    catalog.categories.some(
      (category) =>
        category.slug === "som" || category.nameUk.includes("СОМ"),
    ),
  );
  assert.ok(!catalog.platforms.includes("app"));
});

test("platforms are canonical labels only", () => {
  const catalog = buildCatalogResult(localCatalogProducts, {});
  for (const platform of catalog.platforms) {
    assert.ok(["web", "ios", "android", "macos"].includes(platform));
  }
});
