import type { CatalogProduct } from "@/lib/catalog/types";
import { CATEGORY_INDEX_MIN_PRODUCTS } from "@/lib/seo/constants";

export type EditorialCollection = {
  slug: string;
  titleUk: string;
  introUk: string;
  seoTitle: string;
  seoDescription: string;
  /** Task-oriented query this collection answers. */
  taskQueryUk: string;
  categorySlugs?: string[];
  productSlugs?: string[];
  keywords?: string[];
};

/**
 * Editorial collections for task queries (GEO content scale).
 * Keep intros factual; do not invent traffic/SEO guarantees.
 */
export const EDITORIAL_COLLECTIONS: EditorialCollection[] = [
  {
    slug: "crm-dlya-fop",
    titleUk: "CRM для ФОП і малого бізнесу",
    introUk:
      "Українські CRM і sales-інструменти для обліку клієнтів, угод і follow-up. Підбірка за задачею, не за рекламним бюджетом.",
    seoTitle: "CRM для ФОП — українські продукти",
    seoDescription:
      "Підбірка українських CRM і інструментів продажів для ФОП і команд на dodai.app.",
    taskQueryUk: "CRM для ФОП",
    categorySlugs: ["crm", "sales"],
    keywords: ["crm", "фоп", "продаж", "клієнт"],
  },
  {
    slug: "seo-instrumenty",
    titleUk: "SEO-інструменти від українських команд",
    introUk:
      "Платформи для ключових слів, аудиту та моніторингу пошукової видачі. Органічний список окремо від спонсорованих місць.",
    seoTitle: "SEO-інструменти — українські продукти",
    seoDescription:
      "Українські SEO-платформи та інструменти пошукового маркетингу в каталозі dodai.app.",
    taskQueryUk: "SEO інструменти",
    categorySlugs: ["seo"],
    keywords: ["seo", "пошук", "ключов"],
  },
  {
    slug: "platezhi-online",
    titleUk: "Прийом платежів онлайн",
    introUk:
      "Платіжні шлюзи та сервіси для українського бізнесу. Базове розміщення в каталозі не впливає на голоси.",
    seoTitle: "Прийом платежів — українські продукти",
    seoDescription:
      "Українські платіжні сервіси для онлайн-оплат у каталозі dodai.app.",
    taskQueryUk: "прийом платежів",
    categorySlugs: ["payments", "fintech"],
    keywords: ["плат", "оплат", "payment"],
  },
  {
    slug: "robota-v-ukraini",
    titleUk: "Пошук роботи в Україні",
    introUk:
      "Job-борди та HR-сервіси українського ринку. Каталог допомагає порівняти продукти за фактами на картці.",
    seoTitle: "Робота в Україні — цифрові продукти",
    seoDescription:
      "Українські job-борди та HR-сервіси в каталозі dodai.app.",
    taskQueryUk: "пошук роботи",
    categorySlugs: ["jobs"],
    keywords: ["робот", "ваканс", "hr"],
  },
  {
    slug: "ai-asistenty",
    titleUk: "AI-асистенти українських команд",
    introUk:
      "Продукти зі штучним інтелектом від українських засновників або команд. Перевірювані факти — на публічній сторінці.",
    seoTitle: "AI-асистенти — українські продукти",
    seoDescription:
      "AI-асистенти та продукти з ШІ від українських команд на dodai.app.",
    taskQueryUk: "AI асистент",
    categorySlugs: ["ai"],
    keywords: ["ai", "асист", "голос"],
  },
];

export const COLLECTION_INDEX_MIN_PRODUCTS = CATEGORY_INDEX_MIN_PRODUCTS;

export function matchCollectionProducts(
  collection: EditorialCollection,
  products: CatalogProduct[],
): CatalogProduct[] {
  const keywords = (collection.keywords ?? []).map((item) =>
    item.toLowerCase(),
  );
  const categories = new Set(collection.categorySlugs ?? []);
  const slugs = new Set(collection.productSlugs ?? []);

  return products
    .filter((product) => {
      if (slugs.has(product.slug)) return true;
      if (categories.has(product.categorySlug)) return true;
      if (!keywords.length) return false;
      const haystack = [
        product.name,
        product.tagline,
        product.description ?? "",
        product.categoryName,
      ]
        .join(" ")
        .toLowerCase();
      return keywords.some((keyword) => haystack.includes(keyword));
    })
    .sort((a, b) => a.name.localeCompare(b.name, "uk"));
}

export function isCollectionIndexable(productCount: number): boolean {
  return productCount >= COLLECTION_INDEX_MIN_PRODUCTS;
}

export function getCollectionBySlug(
  slug: string,
): EditorialCollection | undefined {
  return EDITORIAL_COLLECTIONS.find((item) => item.slug === slug);
}

/** Suggest existing editorial collections that might cover a zero-result query. */
export function suggestCollectionsForQuery(q: string): string[] {
  const tokens = q
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length >= 2);
  if (!tokens.length) return [];

  return EDITORIAL_COLLECTIONS.filter((collection) => {
    const haystack = [
      collection.titleUk,
      collection.taskQueryUk,
      ...(collection.keywords ?? []),
      ...(collection.categorySlugs ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return tokens.some((token) => haystack.includes(token));
  }).map((collection) => collection.slug);
}
