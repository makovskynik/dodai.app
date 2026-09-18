import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCatalog } from "@/lib/catalog/queries";
import { isCategoryIndexable } from "@/lib/geo/category-index";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Категорії українських продуктів",
  description:
    "Категорії каталогу dodai.app з короткими intro. Індексуються лише категорії з достатньою кількістю продуктів.",
  path: "/categories",
});

export default async function CategoriesIndexPage() {
  const catalog = await getCatalog({});
  const indexable = catalog.categories.filter(isCategoryIndexable);
  const thin = catalog.categories.filter(
    (category) => !isCategoryIndexable(category),
  );

  return (
    <div className="mx-auto max-w-[880px] px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Головна", path: "/" },
          { name: "Категорії", path: "/categories" },
        ])}
      />

      <header className="mb-10 max-w-2xl">
        <p className="font-mono-meta mb-3 text-[10px] uppercase text-ink/50">
          /categories
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Категорії</h1>
        <p className="mt-3 text-ink/70">
          Кожна індексована категорія має intro і мінімум продуктів. Тонкі
          сторінки не потрапляють у sitemap.
        </p>
      </header>

      <ul className="space-y-3">
        {indexable.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/categories/${category.slug}`}
              className="block rounded-card border border-line bg-surface p-5 hover:bg-copper-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
            >
              <h2 className="text-lg font-semibold">{category.nameUk}</h2>
              <p className="mt-2 text-sm text-ink/70">{category.introUk}</p>
              <p className="font-mono-meta mt-3 text-[10px] uppercase text-ink/45">
                {category.count} продуктів
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {thin.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-lg font-semibold">Ще наповнюються</h2>
          <p className="mt-2 text-sm text-ink/65">
            Поки мало продуктів — сторінки доступні, але noindex.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {thin.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/categories/${category.slug}`}
                  className="inline-flex min-h-11 items-center rounded-pill border border-line bg-surface px-3 text-sm hover:bg-copper-soft"
                >
                  {category.nameUk}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
