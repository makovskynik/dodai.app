import {
  faqJsonLd,
  itemListJsonLd,
  jsonLdScript,
  organizationJsonLd,
  productJsonLd,
  websiteJsonLd,
  breadcrumbJsonLd,
} from "@/lib/seo/json-ld";
import { PLATFORM_FAQ } from "@/lib/geo/faq";
import type { CatalogProduct } from "@/lib/catalog/types";

type JsonLdProps = {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD is generated from trusted server data only.
      dangerouslySetInnerHTML={jsonLdScript(data)}
    />
  );
}

export function HomeJsonLd({ products }: { products: CatalogProduct[] }) {
  return (
    <JsonLd
      data={[
        organizationJsonLd(),
        websiteJsonLd(),
        itemListJsonLd(
          products.slice(0, 12),
          "Українські цифрові продукти на dodai.app",
        ),
        faqJsonLd(PLATFORM_FAQ),
      ]}
    />
  );
}

export function ProductJsonLd({ product }: { product: CatalogProduct }) {
  return (
    <JsonLd
      data={[
        breadcrumbJsonLd([
          { name: "Головна", path: "/" },
          { name: "Каталог", path: "/products" },
          {
            name: product.categoryName,
            path: `/categories/${product.categorySlug}`,
          },
          { name: product.name, path: `/products/${product.slug}` },
        ]),
        productJsonLd(product),
      ]}
    />
  );
}

export function CatalogJsonLd({ products }: { products: CatalogProduct[] }) {
  return (
    <JsonLd
      data={[
        breadcrumbJsonLd([
          { name: "Головна", path: "/" },
          { name: "Каталог", path: "/products" },
        ]),
        itemListJsonLd(products, "Каталог dodai.app"),
      ]}
    />
  );
}
