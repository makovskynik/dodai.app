import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/domain/ProductCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCatalog } from "@/lib/catalog/queries";
import { isCategoryIndexable } from "@/lib/geo/category-index";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const catalog = await getCatalog({});
  return catalog.categories
    .filter(isCategoryIndexable)
    .map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await getCatalog({ category: slug });
  const category = catalog.categories.find((item) => item.slug === slug);
  if (!category) return { title: "Категорія" };

  return buildPageMetadata({
    title: category.seoTitle ?? `${category.nameUk} — українські продукти`,
    description:
      category.seoDescription ??
      category.introUk ??
      `Підбірка українських цифрових продуктів у категорії «${category.nameUk}» на dodai.app.`,
    path: `/categories/${slug}`,
    noIndex: !isCategoryIndexable(category),
  });
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const catalog = await getCatalog({ category: slug, sort: "name" });
  const category = catalog.categories.find((item) => item.slug === slug);
  if (!category) notFound();

  const products = [...catalog.organic, ...catalog.promoted];
  const indexable = isCategoryIndexable(category);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Головна", path: "/" },
            { name: "Категорії", path: "/categories" },
            { name: category.nameUk, path: `/categories/${slug}` },
          ]),
          itemListJsonLd(products, `${category.nameUk} на dodai.app`),
        ]}
      />

      <header className="mb-10 max-w-2xl">
        <p className="font-mono-meta mb-3 text-[10px] uppercase text-ink/50">
          /categories/{slug}
          {!indexable ? " · noindex" : ""}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {category.nameUk}
        </h1>
        <p className="mt-3 text-ink/70">
          {category.introUk ??
            `Українські цифрові продукти в категорії «${category.nameUk}». Органічний список окремо від спонсорованих місць.`}
        </p>
        <p className="font-mono-meta mt-3 text-[10px] uppercase text-ink/45">
          {category.count} продуктів
        </p>
      </header>

      {catalog.promoted.length > 0 ? (
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-semibold">Спонсоровані</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {catalog.promoted.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="mb-4 text-lg font-semibold">Органічні результати</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {catalog.organic.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
