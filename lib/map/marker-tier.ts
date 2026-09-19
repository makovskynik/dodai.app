/** Map marker visual tier. Level 1 is free (no placement row). */
export type MapMarkerTier = 1 | 2 | 3;

export function resolveMapMarkerTier(
  slug: string,
  logoSlugs: Set<string>,
  largeSlugs: Set<string>,
): MapMarkerTier {
  if (largeSlugs.has(slug)) return 3;
  if (logoSlugs.has(slug)) return 2;
  return 1;
}

export const MAP_TIER_RADIUS: Record<MapMarkerTier, number> = {
  1: 5,
  2: 14,
  3: 42,
};

/** Half-size of the logo image inside the circle. */
export const MAP_TIER_LOGO_HALF: Record<MapMarkerTier, number> = {
  1: 4,
  2: 10,
  3: 32,
};

export const MAP_TIER_LABEL_UK: Record<MapMarkerTier, string> = {
  1: "Малий логотип",
  2: "Логотип",
  3: "Великий логотип",
};
