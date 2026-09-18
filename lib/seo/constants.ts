export const SITE_URL = "https://dodai.app";
export const SITE_NAME = "dodai.app";
export const SITE_TAGLINE =
  "Каталог українських цифрових продуктів. Знайди сервіс під задачу або додай свій.";

export const ORGANIZATION = {
  name: "dodai.app",
  alternateName: "dodai+",
  url: SITE_URL,
  description: SITE_TAGLINE,
  foundingLocation: "Ukraine",
} as const;

/** Minimum products before a category page may be indexed. */
export const CATEGORY_INDEX_MIN_PRODUCTS = 3;
