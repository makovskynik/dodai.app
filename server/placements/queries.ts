import { and, eq, inArray } from "drizzle-orm";
import { createDb, type Db } from "@/server/db/client";
import { placements, products } from "@/server/db/schema";
import {
  findOverlappingPlacement,
  listActiveCatalogProductSlugs,
  listActiveMapHighlightSlugs,
  listActiveMapLogoSlugs,
} from "@/lib/placements/inventory";
import { wouldExceedSurfaceCap } from "@/lib/placements/availability";
import { getPlacementSku } from "@/lib/pricing/catalog";
import { LOCAL_DEMO_PLACEMENTS } from "@/lib/placements/local-inventory";
import type {
  PlacementRecord,
  ReservePlacementInput,
} from "@/lib/placements/types";
import { hasDatabase } from "@/lib/env";

function toRecord(
  row: typeof placements.$inferSelect,
  productSlug: string,
): PlacementRecord {
  return {
    id: row.id,
    productId: row.productId,
    productSlug,
    surface: row.surface,
    slotKey: row.slotKey,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt.toISOString(),
    status: row.status,
  };
}

async function loadDbInventory(db: Db): Promise<PlacementRecord[]> {
  const rows = await db
    .select({
      placement: placements,
      productSlug: products.slug,
    })
    .from(placements)
    .innerJoin(products, eq(placements.productId, products.id))
    .where(inArray(placements.status, ["reserved", "active"]));

  return rows.map((row) => toRecord(row.placement, row.productSlug));
}

export async function getPlacementInventory(): Promise<PlacementRecord[]> {
  if (!hasDatabase()) {
    return LOCAL_DEMO_PLACEMENTS;
  }

  try {
    const db = createDb();
    return await loadDbInventory(db);
  } catch (error) {
    console.error("Placement inventory query failed, using local demo", error);
    return LOCAL_DEMO_PLACEMENTS;
  }
}

export async function getActiveCatalogPlacementSlugs(
  now: Date = new Date(),
): Promise<Set<string>> {
  const inventory = await getPlacementInventory();
  return listActiveCatalogProductSlugs(inventory, now);
}

export async function getActiveMapHighlightSlugs(
  now: Date = new Date(),
): Promise<Set<string>> {
  const inventory = await getPlacementInventory();
  return listActiveMapHighlightSlugs(inventory, now);
}

export async function getActiveMapLogoSlugs(
  now: Date = new Date(),
): Promise<Set<string>> {
  const inventory = await getPlacementInventory();
  return listActiveMapLogoSlugs(inventory, now);
}

export class PlacementOverlapError extends Error {
  constructor(message = "Placement slot overlaps an existing reservation") {
    super(message);
    this.name = "PlacementOverlapError";
  }
}

export class PlacementCapacityError extends Error {
  constructor(message = "Немає вільних місць на мапі") {
    super(message);
    this.name = "PlacementCapacityError";
  }
}

export async function reservePlacement(
  input: ReservePlacementInput,
  db: Db = createDb(),
): Promise<PlacementRecord> {
  if (input.endsAt <= input.startsAt) {
    throw new Error("Placement endsAt must be after startsAt");
  }

  if (input.surface === "map_highlight" || input.surface === "map_logo") {
    const fullInventory = await loadDbInventory(db);
    const sku = getPlacementSku(input.surface);
    const cap = sku?.maxConcurrent ?? 1;
    if (
      wouldExceedSurfaceCap(
        fullInventory,
        input.surface,
        input.startsAt,
        input.endsAt,
        cap,
      )
    ) {
      throw new PlacementCapacityError(
        input.surface === "map_logo"
          ? `Немає вільних місць для логотипів на мапі (ліміт ${cap})`
          : `Немає вільних місць для великих маркерів (ліміт ${cap})`,
      );
    }
  }

  const candidates = await db
    .select({
      placement: placements,
      productSlug: products.slug,
    })
    .from(placements)
    .innerJoin(products, eq(placements.productId, products.id))
    .where(
      and(
        eq(placements.surface, input.surface),
        eq(placements.slotKey, input.slotKey),
        inArray(placements.status, ["reserved", "active"]),
      ),
    );

  const inventory = candidates.map((row) =>
    toRecord(row.placement, row.productSlug),
  );
  const overlap = findOverlappingPlacement(inventory, input);
  if (overlap) {
    throw new PlacementOverlapError(
      `Slot ${input.surface}/${input.slotKey} overlaps placement ${overlap.id}`,
    );
  }

  const inserted = await db
    .insert(placements)
    .values({
      productId: input.productId,
      surface: input.surface,
      slotKey: input.slotKey,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      status: input.status ?? "reserved",
    })
    .returning();

  const row = inserted[0];
  return toRecord(row, input.productSlug);
}

export async function expireStalePlacements(
  now: Date = new Date(),
  db: Db = createDb(),
): Promise<number> {
  const outdated = await db
    .select()
    .from(placements)
    .where(inArray(placements.status, ["reserved", "active"]));

  let count = 0;
  for (const row of outdated) {
    if (row.endsAt > now) continue;
    await db
      .update(placements)
      .set({ status: "expired", updatedAt: now })
      .where(eq(placements.id, row.id));
    count += 1;
  }
  return count;
}
