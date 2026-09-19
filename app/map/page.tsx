import type { Metadata } from "next";
import { MapExplorer } from "@/features/map/MapExplorer";
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
  const { clusters, unlocated } = clusterProductsByCity(products);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <header className="max-w-xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-[2.125rem]">
          Мапа продуктів
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink/70">
          Більшість маркерів — компактні точки. Логотип і великий логотип —
          платні рівні з обмеженим інвентарем.
        </p>
      </header>

      <div className="mt-8">
        <MapExplorer
          clusters={clusters}
          unlocated={unlocated}
          logoSlugs={[...logoSlugs]}
          largeSlugs={[...largeSlugs]}
        />
      </div>
    </div>
  );
}
