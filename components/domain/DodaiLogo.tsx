import Link from "next/link";

type DodaiLogoProps = {
  variant?: "primary" | "inverse" | "compact";
  /** Pass `null` to render mark without a link (e.g. home hero). */
  href?: string | null;
  className?: string;
};

export function DodaiLogo({
  variant = "primary",
  href = "/",
  className = "",
}: DodaiLogoProps) {
  const isInverse = variant === "inverse";
  const isCompact = variant === "compact";

  const content = isCompact ? (
    <span
      className={`inline-flex items-center gap-0.5 font-semibold tracking-tight ${className}`}
      aria-label="dodai"
    >
      <span className={isInverse ? "text-surface" : "text-ink"}>d</span>
      <span className="text-copper" aria-hidden="true">
        +
      </span>
    </span>
  ) : (
    <span
      className={`inline-flex items-baseline gap-0.5 text-[1.35rem] font-semibold tracking-tight ${className}`}
      aria-label="dodai"
    >
      <span className={isInverse ? "text-surface" : "text-ink"}>dodai</span>
      <span className="text-copper" aria-hidden="true">
        +
      </span>
    </span>
  );

  if (href == null) return content;

  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center rounded-pill px-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
    >
      {content}
    </Link>
  );
}
