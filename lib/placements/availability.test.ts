import assert from "node:assert/strict";
import test from "node:test";
import {
  getMapHighlightAvailability,
  getSurfaceAvailability,
  wouldExceedSurfaceCap,
} from "./availability";
import { LOCAL_DEMO_PLACEMENTS } from "./local-inventory";
import type { PlacementRecord } from "./types";

test("map large availability under cap of 5", () => {
  const availability = getMapHighlightAvailability(
    LOCAL_DEMO_PLACEMENTS,
    new Date("2026-09-18"),
  );
  assert.equal(availability.maxConcurrent, 5);
  assert.equal(availability.activeCount, 2);
  assert.equal(availability.availableCount, 3);
  assert.equal(availability.canBuyNow, true);
});

test("map logo availability under cap of 25", () => {
  const availability = getSurfaceAvailability(
    LOCAL_DEMO_PLACEMENTS,
    "map_logo",
    new Date("2026-09-18"),
  );
  assert.equal(availability.maxConcurrent, 25);
  assert.equal(availability.activeCount, 4);
  assert.equal(availability.canBuyNow, true);
});

test("map is sold out at five concurrent large markers", () => {
  const full: PlacementRecord[] = Array.from({ length: 5 }, (_, index) => ({
    id: `map-${index}`,
    productId: `p${index}`,
    productSlug: `product-${index}`,
    surface: "map_highlight" as const,
    slotKey: `map-${index}`,
    startsAt: "2026-09-01T00:00:00.000Z",
    endsAt: "2026-10-01T00:00:00.000Z",
    status: "active" as const,
  }));
  const availability = getMapHighlightAvailability(full, new Date("2026-09-18"));
  assert.equal(availability.canBuyNow, false);
  assert.equal(
    wouldExceedSurfaceCap(
      full,
      "map_highlight",
      new Date("2026-09-10"),
      new Date("2026-10-10"),
      5,
    ),
    true,
  );
});
