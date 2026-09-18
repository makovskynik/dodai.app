import type {
  PlacementRecord,
  PlacementStatus,
  PlacementSurface,
  ReservePlacementInput,
} from "@/lib/placements/types";

const CATALOG_SURFACES: PlacementSurface[] = [
  "catalog_home",
  "catalog_category",
];

export function rangesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function isPlacementLive(
  placement: Pick<PlacementRecord, "status" | "startsAt" | "endsAt">,
  now: Date = new Date(),
): boolean {
  if (placement.status !== "active" && placement.status !== "reserved") {
    return false;
  }
  const startsAt = new Date(placement.startsAt);
  const endsAt = new Date(placement.endsAt);
  return startsAt <= now && now < endsAt && placement.status === "active";
}

export function findOverlappingPlacement(
  inventory: PlacementRecord[],
  input: Pick<
    ReservePlacementInput,
    "surface" | "slotKey" | "startsAt" | "endsAt"
  >,
): PlacementRecord | undefined {
  return inventory.find((placement) => {
    if (placement.surface !== input.surface) return false;
    if (placement.slotKey !== input.slotKey) return false;
    if (placement.status !== "reserved" && placement.status !== "active") {
      return false;
    }
    return rangesOverlap(
      input.startsAt,
      input.endsAt,
      new Date(placement.startsAt),
      new Date(placement.endsAt),
    );
  });
}

export function listActivePlacements(
  inventory: PlacementRecord[],
  now: Date = new Date(),
  surfaces?: PlacementSurface[],
): PlacementRecord[] {
  return inventory.filter((placement) => {
    if (surfaces && !surfaces.includes(placement.surface)) return false;
    return isPlacementLive(placement, now);
  });
}

export function listActiveCatalogProductSlugs(
  inventory: PlacementRecord[],
  now: Date = new Date(),
): Set<string> {
  const active = listActivePlacements(inventory, now, CATALOG_SURFACES);
  return new Set(active.map((placement) => placement.productSlug));
}

export function listActiveMapHighlightSlugs(
  inventory: PlacementRecord[],
  now: Date = new Date(),
): Set<string> {
  const active = listActivePlacements(inventory, now, ["map_highlight"]);
  return new Set(active.map((placement) => placement.productSlug));
}

export function effectivePlacementStatus(
  placement: PlacementRecord,
  now: Date = new Date(),
): PlacementStatus {
  if (placement.status === "cancelled") return "cancelled";
  if (new Date(placement.endsAt) <= now) return "expired";
  if (placement.status === "reserved" && new Date(placement.startsAt) > now) {
    return "reserved";
  }
  if (
    placement.status === "active" &&
    new Date(placement.startsAt) <= now &&
    now < new Date(placement.endsAt)
  ) {
    return "active";
  }
  if (new Date(placement.endsAt) <= now) return "expired";
  return placement.status;
}
