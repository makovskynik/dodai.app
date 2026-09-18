/** Canonical platform keys for catalog facets and cards. */
export const CATALOG_PLATFORMS = ["web", "ios", "android", "macos"] as const;

export type CatalogPlatform = (typeof CATALOG_PLATFORMS)[number];

const PLATFORM_LABELS: Record<CatalogPlatform, string> = {
  web: "Web",
  ios: "iOS",
  android: "Android",
  macos: "macOS",
};

const ALLOWED = new Set<string>(CATALOG_PLATFORMS);

export function isCatalogPlatform(value: string): value is CatalogPlatform {
  return ALLOWED.has(value);
}

export function normalizePlatforms(platforms: string[]): CatalogPlatform[] {
  const seen = new Set<CatalogPlatform>();
  const result: CatalogPlatform[] = [];
  for (const raw of platforms) {
    const key = raw.trim().toLowerCase();
    if (!isCatalogPlatform(key) || seen.has(key)) continue;
    seen.add(key);
    result.push(key);
  }
  return result.length > 0 ? result : ["web"];
}

export function platformLabel(platform: string): string {
  return isCatalogPlatform(platform) ? PLATFORM_LABELS[platform] : platform;
}

export function listFacetPlatforms(platforms: string[]): CatalogPlatform[] {
  return normalizePlatforms(platforms).sort((a, b) =>
    PLATFORM_LABELS[a].localeCompare(PLATFORM_LABELS[b], "uk"),
  );
}
