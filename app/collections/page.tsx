import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCatalog } from "@/lib/catalog/queries";
import {
  EDITORIAL_COLLECTIONS,
  isCollectionIndexable,
  matchCollectionProducts,
} from "@/lib/geo/collections";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Підбірки за задачею",
  description:
    "Редакційні підбірки українських цифрових продуктів під конкретні задачі: CRM, SEO, платежі, робота, AI.",
  path: "/collections",
});

export default async function CollectionsIndexPage() {
  const catalog = await getCatalog({});
  const all = [...catalog.organic, ...catalog.promoted];

  const rows = EDITORIAL_COLLECTIONS.map((collection) => {
    const products = matchCollectionProducts(collection, all);
    return {
      collection,
      count: products.length,
      indexable: isCollectionIndexable(products.length),
    };
  });

  return (
    <div className="mx-auto max-w-[880px] px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Головна", path: "/" },
          { name: "Підбірки", path: "/collections" },
        ])}
      />

      <header className="mb-10 max-w-2xl">
        <p className="font-mono-meta mb-3 text-[10px] uppercase text-ink/50">
          /collections
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Підбірки за задачею
        </h1>
        <p className="mt-3 text-ink/70">
          Редакційні колекції для типових запитів. Не змішуємо з оплаченим
          ранжуванням.
        </p>
      </header>

      <ul className="space-y-3">
        {rows.map(({ collection, count, indexable }) => (
          <li key={collection.slug}>
            <Link
              href={`/collections/${collection.slug}`}
              className="block rounded-card border border-line bg-surface p-5 hover:bg-copper-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
            >
              <p className="font-mono-meta text-[10px] uppercase text-ink/45">
                {collection.taskQueryUk}
                {!indexable ? " · noindex" : ""}
              </p>
              <h2 className="mt-2 text-lg font-semibold">{collection.titleUk}</h2>
              <p className="mt-2 text-sm text-ink/70">{collection.introUk}</p>
              <p className="font-mono-meta mt-3 text-[10px] uppercase text-ink/45">
                {count} продуктів
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
