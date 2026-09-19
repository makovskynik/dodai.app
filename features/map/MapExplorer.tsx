"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ProductLogo } from "@/components/domain/ProductLogo";
import {
  UkraineMapSvg,
  DETAIL_ZOOM,
  clampMapFocus,
} from "@/components/domain/UkraineMapSvg";
import { PlacementBadge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import type { CatalogProduct } from "@/lib/catalog/types";
import type { MapCluster } from "@/lib/map/cluster";

const MIN_ZOOM = 1;
const MAX_ZOOM = 2.8;

type MapExplorerProps = {
  clusters: MapCluster[];
  logoSlugs: string[];
  largeSlugs: string[];
};

function ProductPreviewRow({
  product,
  tier,
}: {
  product: CatalogProduct;
  tier: 1 | 2 | 3;
}) {
  return (
    <li>
      <Link
        href={`/products/${product.slug}`}
        className="flex min-h-11 items-start gap-3 rounded-card border border-line bg-canvas/60 p-3 hover:bg-copper-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
      >
        <ProductLogo
          name={product.name}
          initials={product.initials}
          logoUrl={product.logoUrl}
          surface={product.surface}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-ink">{product.name}</span>
            {tier === 3 ? (
              <span className="font-mono-meta rounded-pill border border-line bg-surface px-2 py-0.5 text-[10px] uppercase text-ink/60">
                Великий лого
              </span>
            ) : tier === 2 ? (
              <span className="font-mono-meta rounded-pill border border-line bg-surface px-2 py-0.5 text-[10px] uppercase text-ink/60">
                Логотип
              </span>
            ) : product.badge === "promoted" ? (
              <PlacementBadge />
            ) : null}
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-ink/70">{product.tagline}</p>
          <p className="font-mono-meta mt-2 text-[10px] uppercase text-ink/45">
            {product.categoryName}
          </p>
        </div>
        <span className="shrink-0 self-center text-sm text-copper-dark">
          Відкрити
        </span>
      </Link>
    </li>
  );
}

function clampZoom(value: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(value.toFixed(2))));
}

export function MapExplorer({
  clusters,
  logoSlugs,
  largeSlugs,
}: MapExplorerProps) {
  const router = useRouter();
  const logoSet = new Set(logoSlugs);
  const largeSet = new Set(largeSlugs);
  const [activeCitySlug, setActiveCitySlug] = useState<string | null>(null);
  const [emptyOblastName, setEmptyOblastName] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [focus, setFocus] = useState({ x: 500, y: 340 });

  const defaultFocus = useMemo(() => {
    if (clusters.length === 0) return { x: 500, y: 340 };
    const sum = clusters.reduce(
      (acc, cluster) => ({
        x: acc.x + cluster.city.x,
        y: acc.y + cluster.city.y,
      }),
      { x: 0, y: 0 },
    );
    return {
      x: sum.x / clusters.length,
      y: sum.y / clusters.length,
    };
  }, [clusters]);

  useEffect(() => {
    setFocus(clampMapFocus(defaultFocus.x, defaultFocus.y, 1));
  }, [defaultFocus.x, defaultFocus.y]);

  const activeCluster =
    clusters.find((cluster) => cluster.city.slug === activeCitySlug) ?? null;

  function openCity(citySlug: string) {
    setEmptyOblastName(null);
    setActiveCitySlug(citySlug);
    const city = clusters.find((cluster) => cluster.city.slug === citySlug)?.city;
    const nextZoom = Math.max(zoom, DETAIL_ZOOM);
    setZoom(nextZoom);
    if (city) {
      setFocus(clampMapFocus(city.x, city.y, nextZoom));
    }
  }

  function closePanels() {
    setActiveCitySlug(null);
    setEmptyOblastName(null);
  }

  function adjustZoom(delta: number) {
    setZoom((current) => {
      const next = clampZoom(current + delta);
      setFocus((point) => clampMapFocus(point.x, point.y, next));
      return next;
    });
  }

  function zoomByFactor(factor: number) {
    setZoom((current) => {
      const next = clampZoom(current * factor);
      setFocus((point) => clampMapFocus(point.x, point.y, next));
      return next;
    });
  }

  function panBy(deltaMapX: number, deltaMapY: number) {
    setFocus((point) =>
      clampMapFocus(point.x - deltaMapX, point.y - deltaMapY, zoom),
    );
  }

  function resetCamera() {
    setZoom(1);
    setFocus(clampMapFocus(defaultFocus.x, defaultFocus.y, 1));
    setActiveCitySlug(null);
  }

  const zoomLabel = `${zoom.toFixed(1)}×`;

  return (
    <div className="space-y-4">
      <div
        className="relative mx-auto w-full max-w-[820px] overflow-hidden"
        aria-label="Інтерактивна мапа"
      >
        <div className="absolute right-0 top-0 z-10 flex gap-1 rounded-pill border border-line bg-surface/95 p-1 shadow-soft">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Віддалити"
            className="min-h-10 min-w-10 px-0"
            disabled={zoom <= MIN_ZOOM}
            onClick={() => adjustZoom(-0.35)}
          >
            −
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Наблизити"
            className="min-h-10 min-w-10 px-0"
            disabled={zoom >= MAX_ZOOM}
            onClick={() => adjustZoom(0.35)}
          >
            +
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`Поточний масштаб ${zoomLabel}. Натисніть, щоб скинути до 1×`}
            className="min-h-10 min-w-14 px-2 tabular-nums"
            onClick={resetCamera}
          >
            {zoomLabel}
          </Button>
        </div>

        <div className="aspect-[1000/680] w-full touch-none">
          <UkraineMapSvg
            clusters={clusters}
            logoSlugs={logoSet}
            largeSlugs={largeSet}
            activeCitySlug={activeCitySlug}
            zoom={zoom}
            focusX={focus.x}
            focusY={focus.y}
            onOpenCity={openCity}
            onOpenProduct={(product) => {
              if (!product.slug) {
                return;
              }
              setActiveCitySlug(null);
              setEmptyOblastName(null);
              router.push(`/products/${product.slug}`);
            }}
            onEmptyOblast={(nameUk) => {
              setActiveCitySlug(null);
              setEmptyOblastName(nameUk);
            }}
            onPan={panBy}
            onZoomByFactor={zoomByFactor}
            onZoomDelta={adjustZoom}
          />
        </div>
      </div>

      <p className="text-center text-sm text-ink/50">
        Більший логотип — платне місце на мапі.{" "}
        <Link
          href="/pricing"
          className="text-ink/70 underline-offset-2 hover:text-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
        >
          Тарифи
        </Link>
      </p>

      <ul className="sr-only">
        {clusters.map((cluster) => (
          <li key={cluster.city.slug}>
            <button type="button" onClick={() => openCity(cluster.city.slug)}>
              {cluster.city.nameUk}: {cluster.products.length} продуктів
            </button>
          </li>
        ))}
      </ul>

      <Dialog
        open={Boolean(activeCluster)}
        title={
          activeCluster
            ? `${activeCluster.city.nameUk} · ${activeCluster.products.length}`
            : ""
        }
        onClose={closePanels}
        footer={
          activeCluster ? (
            <div className="flex flex-wrap gap-3">
              <LinkButton
                href={`/products?q=${encodeURIComponent(activeCluster.city.nameUk)}`}
                variant="primary"
                size="sm"
              >
                Усі в каталозі
              </LinkButton>
              <LinkButton href="/submit" variant="secondary" size="sm">
                Додати продукт
              </LinkButton>
            </div>
          ) : null
        }
      >
        {activeCluster ? (
          <ul className="space-y-3">
            {activeCluster.products.map((product) => {
              const tier = largeSet.has(product.slug)
                ? 3
                : logoSet.has(product.slug)
                  ? 2
                  : 1;
              return (
                <ProductPreviewRow
                  key={product.id}
                  product={product}
                  tier={tier}
                />
              );
            })}
          </ul>
        ) : null}
      </Dialog>

      <Dialog
        open={Boolean(emptyOblastName)}
        title={emptyOblastName ?? ""}
        onClose={closePanels}
        footer={
          <div className="flex flex-wrap gap-3">
            <LinkButton href="/submit" variant="primary" size="sm">
              Додати продукт
            </LinkButton>
            <LinkButton href="/products" variant="secondary" size="sm">
              До каталогу
            </LinkButton>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-ink/75">
          Поки немає продуктів із командою в цій області. Якщо ваш сервіс звідси —
          додайте картку в dodai.
        </p>
      </Dialog>
    </div>
  );
}
