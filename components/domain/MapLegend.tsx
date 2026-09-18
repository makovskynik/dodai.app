import { DodaiMapPin } from "@/components/domain/MapMarker";

export function MapLegend() {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink/70">
      <li className="flex items-center gap-2">
        <span
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface"
          aria-hidden
        >
          <span className="h-5 w-5 rounded-full bg-canvas" />
        </span>
        <span>Звичайний маркер</span>
      </li>
      <li className="flex items-center gap-2">
        <span
          className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-line bg-surface"
          aria-hidden
        >
          <span className="h-10 w-10 rounded-full bg-canvas" />
        </span>
        <span>Спонсор на мапі (×3, до 5)</span>
      </li>
      <li className="flex items-center gap-2">
        <DodaiMapPin />
        <span>dodai</span>
      </li>
    </ul>
  );
}
