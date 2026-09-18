import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/domain/ProductCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCatalog } from "@/lib/catalog/queries";
import {
  EDITORIAL_COLLECTIONS,
  getCollectionBySlug,
  isCollectionIndexable,
  matchCollectionProducts,
} from "@/lib/geo/collections";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return EDITORIAL_COLLECTIONS.map((collection) => ({
    slug: collection.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  if (!collection) return { title: "Підбірка" };

  const catalog = await getCatalog({});
  const products = matchCollectionProducts(collection, [
    ...catalog.organic,
    ...catalog.promoted,
  ]);

  return buildPageMetadata({
    title: collection.seoTitle,
    description: collection.seoDescription,
    path: `/collections/${slug}`,
    noIndex: !isCollectionIndexable(products.length),
  });
}

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  if (!collection) notFound();

  const catalog = await getCatalog({});
  const products = matchCollectionProducts(collection, [
    ...catalog.organic,
    ...catalog.promoted,
  ]);
  const promotedSlugs = new Set(catalog.promoted.map((item) => item.slug));
  const organic = products.filter((product) => !promotedSlugs.has(product.slug));
  const promoted = products.filter((product) => promotedSlugs.has(product.slug));
  const indexable = isCollectionIndexable(products.length);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Головна", path: "/" },
            { name: "Підбірки", path: "/collections" },
            { name: collection.titleUk, path: `/collections/${slug}` },
          ]),
          itemListJsonLd(products, collection.titleUk),
        ]}
      />

      <header className="mb-10 max-w-2xl">
        <p className="font-mono-meta mb-3 text-[10px] uppercase text-ink/50">
          /collections/{slug}
          {!indexable ? " · noindex" : ""}
        </p>
        <p className="font-mono-meta text-[10px] uppercase text-copper-dark">
          Задача · {collection.taskQueryUk}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          {collection.titleUk}
        </h1>
        <p className="mt-3 text-ink/70">{collection.introUk}</p>
        <p className="font-mono-meta mt-3 text-[10px] uppercase text-ink/45">
          {products.length} продуктів
        </p>
      </header>

      {promoted.length > 0 ? (
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-semibold">Спонсоровані в підбірці</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {promoted.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="mb-4 text-lg font-semibold">Органічні результати</h2>
        {organic.length === 0 ? (
          <p className="rounded-card border border-line bg-surface p-6 text-ink/70">
            У цій підбірці поки немає органічних продуктів.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {organic.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
