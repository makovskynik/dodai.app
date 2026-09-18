import { CATEGORY_INDEX_MIN_PRODUCTS } from "@/lib/seo/constants";
import type { CatalogCategory } from "@/lib/catalog/types";

export function isCategoryIndexable(category: CatalogCategory): boolean {
  const hasIntro = Boolean(category.introUk?.trim());
  return hasIntro && category.count >= CATEGORY_INDEX_MIN_PRODUCTS;
}
