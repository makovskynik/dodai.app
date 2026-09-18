type MapMarkerProps = {
  label: string;
  sizeBand?: 1 | 2 | 3;
  highlighted?: boolean;
  selected?: boolean;
  className?: string;
};

const sizeClass: Record<1 | 2 | 3, string> = {
  1: "h-9 w-9 text-[11px]",
  2: "h-11 w-11 text-xs",
  3: "h-12 w-12 text-sm",
};

export function MapMarker({
  label,
  sizeBand = 1,
  highlighted = false,
  selected = false,
  className = "",
}: MapMarkerProps) {
  const ring = highlighted
    ? "ring-2 ring-copper ring-offset-2 ring-offset-canvas"
    : selected
      ? "ring-2 ring-ink/40 ring-offset-2 ring-offset-canvas"
      : "";

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border border-line bg-ink font-medium text-surface ${sizeClass[sizeBand]} ${ring} ${className}`}
      aria-hidden="true"
    >
      {label}
    </span>
  );
}

export function DodaiMapPin({ className = "" }: { className?: string }) {
  return (
    <MapMarker label="d+" sizeBand={1} className={`bg-copper text-ink ${className}`} />
  );
}
