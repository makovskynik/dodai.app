"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductSurface } from "@/lib/catalog/types";

const surfaces: Record<ProductSurface, string> = {
  peach: "bg-peach",
  mint: "bg-mint",
  lilac: "bg-lilac",
  sky: "bg-sky",
  surface: "bg-surface",
};

type ProductLogoProps = {
  name: string;
  initials: string;
  logoUrl?: string | null;
  surface?: ProductSurface;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "h-9 w-9 text-[11px] rounded-[12px]",
  md: "h-12 w-12 text-sm rounded-[14px]",
  lg: "h-14 w-14 text-base rounded-[16px]",
} as const;

export function ProductLogo({
  name,
  initials,
  logoUrl,
  surface = "surface",
  size = "md",
  className = "",
}: ProductLogoProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(logoUrl) && !failed;

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden border border-line ${surfaces[surface]} ${sizes[size]} ${className}`}
      aria-hidden="true"
    >
      {showImage ? (
        <Image
          src={logoUrl!}
          alt=""
          width={56}
          height={56}
          className="h-full w-full object-contain p-1.5"
          onError={() => setFailed(true)}
          unoptimized
        />
      ) : (
        <span className="font-semibold text-ink">{initials}</span>
      )}
      <span className="sr-only">{name}</span>
    </span>
  );
}
