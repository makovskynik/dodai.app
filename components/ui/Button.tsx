import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "sm";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
  className?: string;
};

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps & {
  href: string;
  disabled?: boolean;
  rel?: string;
  target?: string;
};

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-pill font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-copper text-surface hover:bg-copper-dark active:bg-copper-dark",
  secondary:
    "border border-line bg-surface text-ink hover:border-ink/25 active:bg-canvas",
  ghost: "text-ink hover:bg-copper-soft active:bg-copper-soft",
};

const sizes: Record<Size, string> = {
  md: "px-5 text-[15px]",
  sm: "min-h-10 px-4 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  children,
  ...props
}: ButtonAsButton) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={props.disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? "Завантаження…" : children}
    </button>
  );
}

export function LinkButton({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  children,
  href,
  disabled,
  rel,
  target,
}: ButtonAsLink) {
  if (disabled || loading) {
    return (
      <span
        className={`${base} ${variants[variant]} ${sizes[size]} ${className} opacity-50`}
        aria-disabled="true"
      >
        {loading ? "Завантаження…" : children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      rel={rel}
      target={target}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...(href.startsWith("http") ? { prefetch: false } : {})}
    >
      {children}
    </Link>
  );
}
