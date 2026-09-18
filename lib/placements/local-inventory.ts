import type { PlacementRecord } from "@/lib/placements/types";

/** Demo inventory used when Neon placements are unavailable. */
export const LOCAL_DEMO_PLACEMENTS: PlacementRecord[] = [
  {
    id: "local-placement-catalog-home-1",
    productId: "wayforpay",
    productSlug: "wayforpay",
    surface: "catalog_home",
    slotKey: "home-1",
    startsAt: new Date(Date.UTC(2026, 8, 1)).toISOString(),
    endsAt: new Date(Date.UTC(2027, 8, 1)).toISOString(),
    status: "active",
  },
  {
    id: "local-placement-map-1",
    productId: "wayforpay",
    productSlug: "wayforpay",
    surface: "map_highlight",
    slotKey: "map-1",
    startsAt: new Date(Date.UTC(2026, 8, 1)).toISOString(),
    endsAt: new Date(Date.UTC(2027, 8, 1)).toISOString(),
    status: "active",
  },
  {
    id: "local-placement-map-2",
    productId: "som",
    productSlug: "som",
    surface: "map_highlight",
    slotKey: "map-2",
    startsAt: new Date(Date.UTC(2026, 8, 1)).toISOString(),
    endsAt: new Date(Date.UTC(2027, 8, 1)).toISOString(),
    status: "active",
  },
  {
    id: "local-placement-map-3",
    productId: "serpstat",
    productSlug: "serpstat",
    surface: "map_highlight",
    slotKey: "map-3",
    startsAt: new Date(Date.UTC(2026, 8, 1)).toISOString(),
    endsAt: new Date(Date.UTC(2027, 8, 1)).toISOString(),
    status: "active",
  },
];
