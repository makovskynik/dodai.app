"use client";

import { useRef } from "react";
import {
  REGION_FILLS,
  UKRAINE_OBLASTS,
} from "@/lib/map/ukraine-oblasts";
import type { MapCluster } from "@/lib/map/cluster";
import { cityByOblastId } from "@/lib/map/cities";
import type { CatalogProduct } from "@/lib/catalog/types";

const DETAIL_ZOOM = 1.7;
const MAP_W = 1000;
const MAP_H = 680;
const DRAG_THRESHOLD_PX = 8;

type UkraineMapSvgProps = {
  clusters: MapCluster[];
  highlightSlugs: Set<string>;
  activeCitySlug: string | null;
  zoom: number;
  focusX: number;
  focusY: number;
  onOpenCity: (citySlug: string) => void;
  onOpenProduct: (product: CatalogProduct) => void;
  onEmptyOblast: (oblastNameUk: string) => void;
  onPan: (deltaMapX: number, deltaMapY: number) => void;
  onZoomByFactor: (factor: number) => void;
  onZoomDelta?: (delta: number) => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function productOffset(count: number, index: number, hasLarge = false) {
  if (count <= 1) return { dx: 0, dy: 0 };
  const radius = (hasLarge ? 52 : 26) + Math.min(count, 8) * 4;
  const angle = -Math.PI / 2 + (index / count) * Math.PI * 2;
  return { dx: Math.cos(angle) * radius, dy: Math.sin(angle) * radius };
}

export function UkraineMapSvg({
  clusters,
  highlightSlugs,
  activeCitySlug,
  zoom,
  focusX,
  focusY,
  onOpenCity,
  onOpenProduct,
  onEmptyOblast,
  onPan,
  onZoomByFactor,
  onZoomDelta,
}: UkraineMapSvgProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pointersRef = useRef(
    new Map<number, { x: number; y: number }>(),
  );
  const pinchRef = useRef<{ distance: number } | null>(null);
  const dragRef = useRef<{
    moved: boolean;
    lastX: number;
    lastY: number;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);

  const clusterByCity = new Map(
    clusters.map((cluster) => [cluster.city.slug, cluster]),
  );

  const vbW = MAP_W / zoom;
  const vbH = MAP_H / zoom;
  const vbX = clamp(focusX - vbW / 2, 0, MAP_W - vbW);
  const vbY = clamp(focusY - vbH / 2, 0, MAP_H - vbH);

  function clientDeltaToMap(dx: number, dy: number) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) {
      return { mx: 0, my: 0 };
    }
    return {
      mx: (dx / rect.width) * vbW,
      my: (dy / rect.height) * vbH,
    };
  }

  function handleOblastClick(oblastId: string, nameUk: string) {
    if (suppressClickRef.current) return;
    const city = cityByOblastId(oblastId);
    if (city && clusterByCity.has(city.slug)) {
      onOpenCity(city.slug);
      return;
    }
    onEmptyOblast(nameUk);
  }

  function handlePointerDown(event: React.PointerEvent<SVGSVGElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    svgRef.current?.setPointerCapture(event.pointerId);

    if (pointersRef.current.size === 1) {
      panStartRef.current = { x: event.clientX, y: event.clientY };
      dragRef.current = {
        moved: false,
        lastX: event.clientX,
        lastY: event.clientY,
      };
      pinchRef.current = null;
    } else if (pointersRef.current.size === 2) {
      const pts = [...pointersRef.current.values()];
      pinchRef.current = {
        distance: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1,
      };
      const midX = (pts[0].x + pts[1].x) / 2;
      const midY = (pts[0].y + pts[1].y) / 2;
      dragRef.current = { moved: true, lastX: midX, lastY: midY };
      suppressClickRef.current = true;
    }
  }

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
    if (!pointersRef.current.has(event.pointerId)) return;

    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (pointersRef.current.size >= 2 && pinchRef.current) {
      const pts = [...pointersRef.current.values()];
      const distance =
        Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
      const factor = distance / pinchRef.current.distance;
      if (Math.abs(factor - 1) > 0.008) {
        onZoomByFactor(factor);
        pinchRef.current.distance = distance;
      }

      const midX = (pts[0].x + pts[1].x) / 2;
      const midY = (pts[0].y + pts[1].y) / 2;
      const drag = dragRef.current;
      if (drag) {
        const { mx, my } = clientDeltaToMap(
          midX - drag.lastX,
          midY - drag.lastY,
        );
        if (mx || my) onPan(mx, my);
        drag.lastX = midX;
        drag.lastY = midY;
      }
      suppressClickRef.current = true;
      return;
    }

    const drag = dragRef.current;
    const start = panStartRef.current;
    if (!drag || !start) return;

    const fromStart = Math.hypot(
      event.clientX - start.x,
      event.clientY - start.y,
    );
    if (!drag.moved && fromStart < DRAG_THRESHOLD_PX) return;

    drag.moved = true;
    suppressClickRef.current = true;
    const { mx, my } = clientDeltaToMap(
      event.clientX - drag.lastX,
      event.clientY - drag.lastY,
    );
    if (mx || my) onPan(mx, my);
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
  }

  function handlePointerUp(event: React.PointerEvent<SVGSVGElement>) {
    pointersRef.current.delete(event.pointerId);
    try {
      svgRef.current?.releasePointerCapture(event.pointerId);
    } catch {
      // ignore
    }

    if (pointersRef.current.size < 2) pinchRef.current = null;

    if (pointersRef.current.size === 1) {
      const remaining = [...pointersRef.current.values()][0];
      panStartRef.current = { x: remaining.x, y: remaining.y };
      dragRef.current = {
        moved: suppressClickRef.current,
        lastX: remaining.x,
        lastY: remaining.y,
      };
      return;
    }

    if (pointersRef.current.size === 0) {
      const wasDragging = dragRef.current?.moved ?? false;
      dragRef.current = null;
      panStartRef.current = null;
      if (wasDragging) {
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 50);
      } else {
        suppressClickRef.current = false;
      }
    }
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`${vbX.toFixed(1)} ${vbY.toFixed(1)} ${vbW.toFixed(1)} ${vbH.toFixed(1)}`}
      className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
      role="img"
      aria-label="Адміністративна мапа України з маркерами продуктів. Перетягуйте, щоб рухати; щипком або кнопками — масштабувати."
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={
        onZoomDelta
          ? (event) => {
              event.preventDefault();
              onZoomDelta(event.deltaY > 0 ? -0.25 : 0.25);
            }
          : undefined
      }
    >
      <defs>
        <filter id="map-soft" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow
            dx="0"
            dy="6"
            stdDeviation="10"
            floodColor="rgba(20,22,22,0.08)"
          />
        </filter>
        <linearGradient id="map-sea" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="color-mix(in srgb, var(--sky) 55%, white)" />
          <stop offset="100%" stopColor="color-mix(in srgb, var(--mint) 35%, white)" />
        </linearGradient>
        <clipPath id="logo-clip">
          <circle cx="0" cy="0" r="14" />
        </clipPath>
        <clipPath id="logo-clip-lg">
          <circle cx="0" cy="0" r="42" />
        </clipPath>
      </defs>

      <rect
        x={vbX - 40}
        y={vbY - 40}
        width={vbW + 80}
        height={vbH + 80}
        fill="url(#map-sea)"
      />

      <g filter="url(#map-soft)">
        {UKRAINE_OBLASTS.map((oblast) => (
          <path
            key={`outline-${oblast.id}`}
            d={oblast.d}
            fill="none"
            stroke="var(--ink)"
            strokeOpacity="0.5"
            strokeWidth={4 / zoom}
            strokeLinejoin="round"
            pointerEvents="none"
          />
        ))}

        {UKRAINE_OBLASTS.map((oblast) => {
          const city = cityByOblastId(oblast.id);
          const cluster = city ? clusterByCity.get(city.slug) : undefined;
          const hasProducts = Boolean(cluster && cluster.products.length > 0);
          const active = Boolean(city && activeCitySlug === city.slug);

          return (
            <path
              key={oblast.id}
              d={oblast.d}
              fill={REGION_FILLS[oblast.region]}
              fillOpacity={hasProducts ? 0.95 : 0.55}
              stroke="var(--surface)"
              strokeWidth={(active ? 2.75 : 1.5) / zoom}
              strokeLinejoin="round"
              className="hover:brightness-[0.97]"
              onClick={() => handleOblastClick(oblast.id, oblast.nameUk)}
            >
              <title>
                {hasProducts
                  ? `${oblast.nameUk} · ${cluster!.products.length} продуктів`
                  : `${oblast.nameUk} · поки немає продуктів · Додати`}
              </title>
            </path>
          );
        })}
      </g>

      <g transform="translate(72 118)" aria-hidden="true" pointerEvents="none">
        <circle
          r={16 / Math.min(zoom, 1.4)}
          fill="var(--copper)"
          stroke="var(--surface)"
          strokeWidth={2 / zoom}
        />
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--ink)"
          fontSize={10 / Math.min(zoom, 1.4)}
          fontFamily="IBM Plex Mono, monospace"
          fontWeight="500"
        >
          d+
        </text>
      </g>

      {clusters.map((cluster) => (
        <g key={cluster.city.slug}>
          <text
            x={cluster.city.x}
            y={cluster.city.y - (cluster.products.length > 1 ? 48 : 36)}
            textAnchor="middle"
            fill="var(--ink)"
            fillOpacity="0.55"
            fontSize={11}
            fontFamily="Geologica, sans-serif"
            fontWeight="500"
            className="pointer-events-none select-none"
          >
            {cluster.city.nameUk}
          </text>
          {cluster.products.map((product, index) => {
            const hasLarge = cluster.products.some((item) =>
              highlightSlugs.has(item.slug),
            );
            const { dx, dy } = productOffset(
              cluster.products.length,
              index,
              hasLarge,
            );
            const x = cluster.city.x + dx;
            const y = cluster.city.y + dy;
            // Map size boost is only for purchased map_highlight slots.
            const isMapSponsored = highlightSlugs.has(product.slug);
            const r = isMapSponsored ? 48 : 16;
            const logo = isMapSponsored ? 36 : 12;
            const fontSize = isMapSponsored ? 18 : 9;

            return (
              <g
                key={product.slug}
                transform={`translate(${x} ${y})`}
                className="cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label={
                  isMapSponsored
                    ? `${product.name}, збільшений спонсорський маркер`
                    : product.name
                }
                onClick={(event) => {
                  event.stopPropagation();
                  if (suppressClickRef.current) return;
                  onOpenProduct(product);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpenProduct(product);
                  }
                }}
              >
                <circle
                  r={r}
                  fill="var(--surface)"
                  stroke="var(--ink)"
                  strokeOpacity={isMapSponsored ? 0.28 : 0.18}
                  strokeWidth={isMapSponsored ? 2 : 1.5}
                />
                {product.logoUrl ? (
                  <image
                    href={product.logoUrl}
                    x={-logo}
                    y={-logo}
                    width={logo * 2}
                    height={logo * 2}
                    clipPath={
                      isMapSponsored
                        ? "url(#logo-clip-lg)"
                        : "url(#logo-clip)"
                    }
                    preserveAspectRatio="xMidYMid meet"
                  />
                ) : (
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="var(--ink)"
                    fontSize={fontSize}
                    fontFamily="Geologica, sans-serif"
                    fontWeight="600"
                  >
                    {product.initials}
                  </text>
                )}
                <title>
                  {`${product.name}${isMapSponsored ? " · збільшений на мапі" : ""}`}
                </title>
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
}

export { DETAIL_ZOOM, MAP_W, MAP_H };

export function clampMapFocus(x: number, y: number, zoom: number) {
  const vbW = MAP_W / zoom;
  const vbH = MAP_H / zoom;
  return {
    x: clamp(x, vbW / 2, MAP_W - vbW / 2),
    y: clamp(y, vbH / 2, MAP_H - vbH / 2),
  };
}
