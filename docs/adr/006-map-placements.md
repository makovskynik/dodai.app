# ADR 006 — Map + placement inventory

- Status: Accepted
- Date: 2026-09-18
- Relates to: ADR 001, ADR 002

## Context

Stage 4 needs a secondary map exploration layer and time-bounded paid inventory.
Exact UAH prices for map/promo slots remain an open product decision.

## Decision

1. Store placements as inventory rows: `surface`, `slot_key`, `starts_at`, `ends_at`, `status`.
2. Surfaces: `catalog_home`, `catalog_category`, `map_highlight`.
3. Reject overlapping `reserved`/`active` windows for the same surface+slot in application logic.
4. Catalog `promoted` badges come only from live catalog surfaces — never mixed into organic sort.
5. Map marker size uses city cluster count bands only; map highlights are a copper ring / legend note, not larger pins.
6. `/map` always exposes an accessible product list alternative.
7. Local demo inventory mirrors Neon until migration + seed are applied.
8. Do not invent ad-hoc commercial prices outside `lib/pricing/catalog.ts` (see ADR 010).

## Consequences

- Sponsored blocks stay inventory-driven and labelled.
- Commercial amounts for slots are defined in ADR 010 / `lib/pricing/catalog.ts` and reviewed on `/pricing`.
- Payment checkout for placements still waits on accepting ADR 010; do not invent other prices in UI.
- Product of the Week remains editorial and cannot be bought via placement.
