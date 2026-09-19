import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogJsonLd } from "@/components/seo/JsonLd";
import { CatalogView } from "@/features/catalog/CatalogView";
import {
  getCatalog,
  recordZeroResultSearch,
} from "@/lib/catalog/queries";
import type { CatalogQuery } from "@/lib/catalog/types";
import { parsePageParam } from "@/lib/catalog/pagination";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function parseQuery(
  params: Record<string, string | string[] | undefined>,
): CatalogQuery {
  const read = (key: string) => {
    const value = params[key];
    return typeof value === "string" ? value : undefined;
  };

  const sort = read("sort");
  const page = parsePageParam(params.page);
  return {
    q: read("q"),
    category: read("category"),
    platform: read("platform"),
    sort: sort === "name" ? "name" : "new",
    page: page > 1 ? page : undefined,
  };
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const query = parseQuery(await searchParams);
  const hasFilters = Boolean(
    query.q || query.category || query.platform || (query.page && query.page > 1),
  );

  return buildPageMetadata({
    title: "Каталог українських цифрових продуктів",
    description:
      "Пошук українських сервісів і застосунків за задачею, категорією та платформою.",
    path: "/products",
    noIndex: hasFilters,
  });
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const query = parseQuery(await searchParams);
  const catalog = await getCatalog(query);

  if (catalog.zeroResult) {
    await recordZeroResultSearch(query);
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
      <CatalogJsonLd products={[...catalog.organic, ...catalog.promoted]} />

      <header className="mb-10 max-w-2xl">
        <p className="font-mono-meta mb-3 text-[10px] uppercase text-ink/50">
          /products
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Каталог
        </h1>
        <p className="mt-3 text-ink/70">
          Шукай за задачею. Фільтри — лише щоб звузити видачу.
        </p>
      </header>

      <Suspense
        fallback={
          <div className="rounded-card border border-line bg-surface p-6 text-ink/60">
            Завантаження каталогу…
          </div>
        }
      >
        <CatalogView catalog={catalog} />
      </Suspense>
    </div>
  );
}
