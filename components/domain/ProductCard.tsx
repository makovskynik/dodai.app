import Link from "next/link";
import {
  PlacementBadge,
  ProductDayBadge,
  VerifiedBadge,
} from "@/components/ui/Badge";
import { ProductLogo } from "@/components/domain/ProductLogo";
import { VoteControl } from "@/components/domain/VoteControl";
import { platformLabel } from "@/lib/catalog/platforms";
import { getTurnstileSiteKey } from "@/lib/security/turnstile";
import type { CatalogProduct } from "@/lib/catalog/types";

type ProductCardProps = {
  product: CatalogProduct;
  href?: string;
  vote?: {
    launchId: string;
    voteCount: number;
    hasVoted: boolean;
  };
};

const CATEGORY_LABEL_UK: Record<string, string> = {
  Software: "Софт",
  Influencer: "Інфлюенсери",
  SEO: "SEO",
  CRM: "CRM",
  AI: "AI",
  EdTech: "EdTech",
};

function formatCardMeta(categoryName: string, platforms: string[]): string {
  const category = CATEGORY_LABEL_UK[categoryName] ?? categoryName;
  const limitedPlatforms = platforms.slice(0, 2).map(platformLabel);
  return [category, ...limitedPlatforms].filter(Boolean).join(" · ");
}

export function ProductCard({ product, href, vote }: ProductCardProps) {
  const target = href ?? `/products/${product.slug}`;
  const meta = formatCardMeta(product.categoryName, product.platforms);
  const turnstileSiteKey = getTurnstileSiteKey() ?? null;
  const isVerified = Boolean(product.lastVerifiedAt);
  const showVote =
    vote ??
    (product.activeLaunchId
      ? {
          launchId: product.activeLaunchId,
          voteCount: product.voteCount ?? 0,
          hasVoted: false,
        }
      : null);

  return (
    <article
      className={`group relative flex h-full flex-col rounded-card border bg-surface p-6 transition-[border-color,box-shadow] hover:shadow-soft ${
        isVerified
          ? "border-mint hover:border-success/40"
          : "border-line hover:border-ink/20"
      }`}
    >
      <div className="relative z-10 mb-4 flex items-start justify-between gap-3">
        <ProductLogo
          name={product.name}
          initials={product.initials}
          logoUrl={product.logoUrl}
          surface={product.surface}
          size="md"
        />
        <div className="flex flex-wrap items-start justify-end gap-2">
          {product.badge === "product-of-the-day" ? <ProductDayBadge /> : null}
          {product.badge === "promoted" ? <PlacementBadge /> : null}
          {isVerified ? <VerifiedBadge /> : null}
          {showVote ? (
            <VoteControl
              launchId={showVote.launchId}
              voteCount={showVote.voteCount}
              hasVoted={showVote.hasVoted}
              turnstileSiteKey={turnstileSiteKey}
              compact
            />
          ) : null}
        </div>
      </div>

      <h3 className="text-[1.35rem] font-semibold tracking-tight text-ink">
        <Link
          href={target}
          className="rounded-sm after:absolute after:inset-0 after:z-0 after:rounded-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
        >
          {product.name}
        </Link>
      </h3>

      <p className="mt-2 line-clamp-2 flex-1 text-[15px] leading-snug text-ink/80">
        {product.tagline}
      </p>

      <div className="relative z-10 mt-5 flex items-center justify-between gap-3 pointer-events-none">
        <p className="font-mono-meta text-xs text-ink/65">{meta}</p>
        <span
          className="inline-flex min-h-11 items-center rounded-pill px-3 text-sm font-medium text-copper-dark opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
          aria-hidden="true"
        >
          Відкрити ↗
        </span>
      </div>
    </article>
  );
}
