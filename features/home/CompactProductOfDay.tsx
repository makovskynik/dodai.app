import Link from "next/link";
import { ProductLogo } from "@/components/domain/ProductLogo";
import { ProductDayBadge } from "@/components/ui/Badge";
import type { CatalogProduct } from "@/lib/catalog/types";

type CompactProductOfDayProps = {
  product: CatalogProduct;
};

/** Satellite Product of the Week for home hero — proof, not a second headline. */
export function CompactProductOfDay({ product }: CompactProductOfDayProps) {
  return (
    <aside
      aria-label="Продукт тижня"
      className="rounded-card border border-line bg-surface p-4 shadow-soft sm:p-5"
    >
      <div className="mb-3">
        <ProductDayBadge />
      </div>

      <div className="flex items-start gap-3">
        <ProductLogo
          name={product.name}
          initials={product.initials}
          logoUrl={product.logoUrl}
          surface={product.surface}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold tracking-tight text-ink">
            <Link
              href={`/products/${product.slug}`}
              className="rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
            >
              {product.name}
            </Link>
          </h2>
          <p className="mt-1 line-clamp-2 text-sm text-ink/70">{product.tagline}</p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="font-mono-meta text-[10px] uppercase text-ink/45">
              {product.categoryName}
            </p>
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex min-h-10 items-center rounded-pill px-2 text-sm font-medium text-copper-dark hover:bg-copper-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
            >
              Відкрити ↗
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
