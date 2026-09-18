import type { CatalogProduct } from "@/lib/catalog/types";
import { resolveCity, type MapCity } from "@/lib/map/cities";

export type MapCluster = {
  city: MapCity;
  products: CatalogProduct[];
  /** Size band from count only — never from payment. */
  sizeBand: 1 | 2 | 3;
};

export type MapProductGroups = {
  clusters: MapCluster[];
  unlocated: CatalogProduct[];
};

export function sizeBandFromCount(count: number): 1 | 2 | 3 {
  if (count >= 5) return 3;
  if (count >= 2) return 2;
  return 1;
}

export function clusterProductsByCity(
  products: CatalogProduct[],
): MapProductGroups {
  const byCity = new Map<string, { city: MapCity; products: CatalogProduct[] }>();
  const unlocated: CatalogProduct[] = [];

  for (const product of products) {
    const city = resolveCity(product.cityLabel);
    if (!city) {
      unlocated.push(product);
      continue;
    }
    const current = byCity.get(city.slug);
    if (current) {
      current.products.push(product);
    } else {
      byCity.set(city.slug, { city, products: [product] });
    }
  }

  const clusters: MapCluster[] = [...byCity.values()]
    .map(({ city, products: cityProducts }) => ({
      city,
      products: cityProducts.sort((a, b) => a.name.localeCompare(b.name, "uk")),
      sizeBand: sizeBandFromCount(cityProducts.length),
    }))
    .sort((a, b) => {
      const byCount = b.products.length - a.products.length;
      if (byCount !== 0) return byCount;
      return a.city.nameUk.localeCompare(b.city.nameUk, "uk");
    });

  unlocated.sort((a, b) => a.name.localeCompare(b.name, "uk"));

  return { clusters, unlocated };
}
