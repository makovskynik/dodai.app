import type { ReactNode } from "react";

type BadgeTone = "neutral" | "editorial" | "promoted" | "success" | "warning";

const tones: Record<BadgeTone, string> = {
  neutral: "border-line bg-surface text-ink",
  editorial: "border-transparent bg-mint text-ink",
  promoted: "border-transparent bg-peach text-ink",
  success: "border-transparent bg-mint text-success",
  warning: "border-transparent bg-peach text-warning",
};

type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
};

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`font-mono-meta inline-flex min-h-7 items-center rounded-pill border px-2.5 text-[10px] uppercase tracking-[0.04em] ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function PlacementBadge() {
  return <Badge tone="promoted">Спонсорований</Badge>;
}

export function ProductDayBadge() {
  return <Badge tone="editorial">Продукт тижня</Badge>;
}

export function VerifiedBadge() {
  return (
    <Badge tone="neutral" className="border-mint bg-mint/40 text-ink">
      Підтверджено
    </Badge>
  );
}

export function ProductWeekBadge() {
  return <ProductDayBadge />;
}
