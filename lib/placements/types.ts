export type PlacementSurface =
  | "catalog_home"
  | "catalog_category"
  | "map_highlight"
  | "map_logo";

export type PlacementStatus =
  | "reserved"
  | "active"
  | "expired"
  | "cancelled";

export type PlacementRecord = {
  id: string;
  productId: string;
  productSlug: string;
  surface: PlacementSurface;
  slotKey: string;
  startsAt: string;
  endsAt: string;
  status: PlacementStatus;
};

export type ReservePlacementInput = {
  productId: string;
  productSlug: string;
  surface: PlacementSurface;
  slotKey: string;
  startsAt: Date;
  endsAt: Date;
  status?: Extract<PlacementStatus, "reserved" | "active">;
};
