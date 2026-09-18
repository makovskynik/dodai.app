import Link from "next/link";
import { ProductLogo } from "@/components/domain/ProductLogo";
import type { CatalogProduct } from "@/lib/catalog/types";

type RelatedProductsProps = {
  curated: CatalogProduct[];
  similar: CatalogProduct[];
  showCuratedFirst: boolean;
};

function RelatedList({
  title,
  products,
}: {
  title: string;
  products: CatalogProduct[];
}) {
  if (products.length === 0) return null;
  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {products.map((product) => (
          <li key={product.id}>
            <Link
              href={`/products/${product.slug}`}
              className="flex gap-3 rounded-card border border-line bg-surface p-3 hover:bg-copper-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
            >
              <ProductLogo
                name={product.name}
                initials={product.initials}
                logoUrl={product.logoUrl}
                surface={product.surface}
                size="sm"
              />
              <span className="min-w-0">
                <span className="block font-medium text-ink">{product.name}</span>
                <span className="mt-0.5 line-clamp-2 block text-sm text-ink/65">
                  {product.tagline}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RelatedProducts({
  curated,
  similar,
  showCuratedFirst,
}: RelatedProductsProps) {
  if (curated.length === 0 && similar.length === 0) return null;

  return (
    <section className="mt-12 space-y-10 border-t border-line pt-10">
      {showCuratedFirst ? (
        <RelatedList title="Пов’язані проєкти" products={curated} />
      ) : null}
      <RelatedList title="Схожі проєкти" products={similar} />
    </section>
  );
}
