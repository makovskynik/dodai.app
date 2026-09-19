import { getPlacementSku } from "@/lib/pricing/catalog";
import {
  listActivePlacements,
  rangesOverlap,
} from "@/lib/placements/inventory";
import type { PlacementRecord, PlacementSurface } from "@/lib/placements/types";

export type PlacementAvailability = {
  surface: PlacementSurface;
  maxConcurrent: number;
  activeCount: number;
  availableCount: number;
  canBuyNow: boolean;
  statusUk: string;
};

export function getSurfaceAvailability(
  inventory: PlacementRecord[],
  surface: PlacementSurface,
  now: Date = new Date(),
): PlacementAvailability {
  const sku = getPlacementSku(surface);
  const maxConcurrent = sku?.maxConcurrent ?? 1;
  const activeCount = listActivePlacements(inventory, now, [surface]).length;
  const availableCount = Math.max(0, maxConcurrent - activeCount);
  const canBuyNow = availableCount > 0;

  let statusUk: string;
  if (canBuyNow) {
    statusUk =
      availableCount === maxConcurrent
        ? `Усі ${maxConcurrent} місць вільні`
        : `Вільно ${availableCount} з ${maxConcurrent}`;
  } else {
    statusUk = `Зайнято ${maxConcurrent}/${maxConcurrent} · зараз купити не можна`;
  }

  return {
    surface,
    maxConcurrent,
    activeCount,
    availableCount,
    canBuyNow,
    statusUk,
  };
}

export function getMapHighlightAvailability(
  inventory: PlacementRecord[],
  now: Date = new Date(),
): PlacementAvailability {
  return getSurfaceAvailability(inventory, "map_highlight", now);
}

/** True if adding one more slot for [startsAt, endsAt) would exceed cap. */
export function wouldExceedSurfaceCap(
  inventory: PlacementRecord[],
  surface: PlacementSurface,
  startsAt: Date,
  endsAt: Date,
  maxConcurrent: number,
): boolean {
  const overlapping = inventory.filter((placement) => {
    if (placement.surface !== surface) return false;
    if (placement.status !== "active" && placement.status !== "reserved") {
      return false;
    }
    return rangesOverlap(
      startsAt,
      endsAt,
      new Date(placement.startsAt),
      new Date(placement.endsAt),
    );
  });
  return overlapping.length >= maxConcurrent;
}

/** @deprecated Prefer wouldExceedSurfaceCap */
export function wouldExceedMapHighlightCap(
  inventory: PlacementRecord[],
  startsAt: Date,
  endsAt: Date,
  maxConcurrent = 5,
): boolean {
  return wouldExceedSurfaceCap(
    inventory,
    "map_highlight",
    startsAt,
    endsAt,
    maxConcurrent,
  );
}
