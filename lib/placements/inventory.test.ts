import assert from "node:assert/strict";
import test from "node:test";
import {
  findOverlappingPlacement,
  isPlacementLive,
  listActiveCatalogProductSlugs,
  rangesOverlap,
} from "./inventory";
import { applyActivePlacements } from "./apply";
import { LOCAL_DEMO_PLACEMENTS } from "./local-inventory";
import type { CatalogProduct } from "@/lib/catalog/types";
import type { PlacementRecord } from "./types";

test("ranges overlap when windows intersect", () => {
  const aStart = new Date("2026-09-01");
  const aEnd = new Date("2026-09-30");
  assert.equal(
    rangesOverlap(aStart, aEnd, new Date("2026-09-15"), new Date("2026-10-15")),
    true,
  );
  assert.equal(
    rangesOverlap(aStart, aEnd, new Date("2026-10-01"), new Date("2026-10-15")),
    false,
  );
});

test("findOverlappingPlacement detects same surface and slot", () => {
  const inventory: PlacementRecord[] = [
    {
      id: "1",
      productId: "p1",
      productSlug: "alpha",
      surface: "catalog_home",
      slotKey: "home-1",
      startsAt: "2026-09-01T00:00:00.000Z",
      endsAt: "2026-10-01T00:00:00.000Z",
      status: "active",
    },
  ];

  const overlap = findOverlappingPlacement(inventory, {
    surface: "catalog_home",
    slotKey: "home-1",
    startsAt: new Date("2026-09-15T00:00:00.000Z"),
    endsAt: new Date("2026-09-20T00:00:00.000Z"),
  });
  assert.ok(overlap);

  const free = findOverlappingPlacement(inventory, {
    surface: "catalog_home",
    slotKey: "home-2",
    startsAt: new Date("2026-09-15T00:00:00.000Z"),
    endsAt: new Date("2026-09-20T00:00:00.000Z"),
  });
  assert.equal(free, undefined);
});

test("expired placements are not live", () => {
  const expired: PlacementRecord = {
    ...LOCAL_DEMO_PLACEMENTS[0],
    startsAt: "2025-01-01T00:00:00.000Z",
    endsAt: "2025-02-01T00:00:00.000Z",
    status: "active",
  };
  assert.equal(isPlacementLive(expired, new Date("2026-09-18")), false);
});

test("local demo inventory promotes wayforpay in catalog", () => {
  const slugs = listActiveCatalogProductSlugs(
    LOCAL_DEMO_PLACEMENTS,
    new Date("2026-09-18"),
  );
  assert.ok(slugs.has("wayforpay"));
});

test("applyActivePlacements never overrides product of the day", () => {
  const product = {
    slug: "serpstat",
    badge: "product-of-the-day",
  } as CatalogProduct;
  const result = applyActivePlacements([product], new Set(["serpstat"]));
  assert.equal(result[0].badge, "product-of-the-day");
});
