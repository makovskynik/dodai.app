import type { Metadata } from "next";
import { MapExplorer } from "@/features/map/MapExplorer";
import { LinkButton } from "@/components/ui/Button";
import { getCatalog } from "@/lib/catalog/queries";
import { clusterProductsByCity } from "@/lib/map/cluster";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  getActiveMapHighlightSlugs,
  getActiveMapLogoSlugs,
} from "@/server/placements/queries";

export const metadata: Metadata = buildPageMetadata({
  title: "Мапа українських продуктів",
  description:
    "Контекст українських цифрових продуктів на мапі. Навігація, не рейтинг за оплату.",
  path: "/map",
});

export default async function MapPage() {
  const [catalog, logoSlugs, largeSlugs] = await Promise.all([
    getCatalog({ sort: "name" }),
    getActiveMapLogoSlugs(),
    getActiveMapHighlightSlugs(),
  ]);

  const products = [...catalog.organic, ...catalog.promoted];
  const { clusters } = clusterProductsByCity(products);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-[2.125rem]">
            Мапа продуктів
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink/70">
            Де базуються українські цифрові продукти.
          </p>
        </div>
        <LinkButton href="/products" variant="secondary" size="sm">
          У каталог
        </LinkButton>
      </header>

      <div className="mt-6">
        <MapExplorer
          clusters={clusters}
          logoSlugs={[...logoSlugs]}
          largeSlugs={[...largeSlugs]}
        />
      </div>
    </div>
  );
}
