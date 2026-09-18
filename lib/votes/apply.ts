import type { CatalogProduct } from "@/lib/catalog/types";
import { awardWeekStartKyiv } from "@/lib/votes/rules";
import type { AwardRecord } from "@/lib/votes/rules";

/** Apply immutable Product of the Week award. Never combines with promoted. */
export function applyProductOfTheDayAward(
  products: CatalogProduct[],
  awards: AwardRecord[],
  now: Date = new Date(),
): CatalogProduct[] {
  const weekStart = awardWeekStartKyiv(now);
  const potw = awards.find(
    (award) =>
      award.awardType === "product_of_the_day" &&
      award.awardDate === weekStart,
  );
  if (!potw) return products;

  return products.map((product) => {
    if (product.slug !== potw.productSlug) {
      if (product.badge === "product-of-the-day") {
        return { ...product, badge: null };
      }
      return product;
    }
    // Paid placement must never show Product of the Week badge.
    if (product.badge === "promoted") {
      return product;
    }
    return { ...product, badge: "product-of-the-day" as const };
  });
}
