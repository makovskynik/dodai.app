import { getPlacementSku } from "@/lib/pricing/catalog";
import {
  listActivePlacements,
  rangesOverlap,
} from "@/lib/placements/inventory";
import type { PlacementRecord } from "@/lib/placements/types";

export type PlacementAvailability = {
  surface: "map_highlight" | "catalog_home" | "catalog_category";
  maxConcurrent: number;
  activeCount: number;
  availableCount: number;
  canBuyNow: boolean;
  statusUk: string;
};

function monthWindow(now: Date): { start: Date; end: Date } {
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0),
  );
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0),
  );
  return { start, end };
}

/**
 * Count placements that occupy inventory during the current calendar month
 * (UTC), including active/reserved that overlap the month window.
 */
export function countOccupyingPlacements(
  inventory: PlacementRecord[],
  surface: PlacementAvailability["surface"],
  now: Date = new Date(),
): number {
  const { start, end } = monthWindow(now);
  const occupying = inventory.filter((placement) => {
    if (placement.surface !== surface) return false;
    if (placement.status !== "active" && placement.status !== "reserved") {
      return false;
    }
    return rangesOverlap(
      start,
      end,
      new Date(placement.startsAt),
      new Date(placement.endsAt),
    );
  });
  // Concurrent cap is about simultaneous live slots — use live-now when available,
  // else fall back to month-overlapping unique products.
  const liveNow = listActivePlacements(inventory, now, [surface]);
  if (liveNow.length > 0 || occupying.length === 0) {
    return liveNow.length;
  }
  return new Set(occupying.map((item) => item.productSlug)).size;
}

export function getSurfaceAvailability(
  inventory: PlacementRecord[],
  surface: PlacementAvailability["surface"],
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

/** True if adding one more map slot for [startsAt, endsAt) would exceed cap. */
export function wouldExceedMapHighlightCap(
  inventory: PlacementRecord[],
  startsAt: Date,
  endsAt: Date,
  maxConcurrent = 5,
): boolean {
  const overlapping = inventory.filter((placement) => {
    if (placement.surface !== "map_highlight") return false;
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
