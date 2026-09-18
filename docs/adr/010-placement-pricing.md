# ADR 010 — Placement & listing pricing (v2)

- Status: Proposed (UI on `/pricing`)
- Date: 2026-09-18 (amended same day → v2)
- Relates to: ADR 005, ADR 006, ADR 007

## Context

v1 mirrored a ~100 UAH paid base (same ballpark as a competing directory). That is a weak position: no differentiation, race-to-bottom on entry, and money muddies the “honest catalog” story.

Category inventory with **2 equal slots** left an open fight: who is first vs second?

## Decision

1. Prices live in `lib/pricing/catalog.ts` (`PRICING_VERSION = 2026-09-v3`).
2. **Base listing: 0 UAH** or **Passport 300 UAH** one-time. Publish still requires moderation; free ≠ unreviewed.
3. Sponsored inventory is **30 days only** (no weekly SKU):
   | Surface | Rule | 30 days | Cap (concurrent products) |
   |---|---|---:|---|
   | `catalog_home` | Equal cards; order by slot `starts_at` (FIFO) | 1990 | 3 |
   | `catalog_category` | **Exclusive #1 only** — one sponsor per category | 1290 | **1** |
   | `map_highlight` | Equal ×3 marker size (not label); max 5 concurrent; no price tiers of size | 690 | 5 |
4. **No unordered multi-slot category.** If demand needs a #2 later, introduce an explicit cheaper SKU with different UI weight — never two “same” slots.
5. Optional paid services (soon): priority moderation 300, Verified 500 — not organic rank.
6. **Not for sale:** organic sort, votes, Product of the Week, dofollow, traffic guarantees, map size levels 1–2–3 by payment amount.
7. `/pricing` shows live availability (`вільно N з max`) so buyers know if they can purchase now.
8. Placement checkout still waits on accepting this tariff; base checkout amount becomes **0** (skip payment → moderation queue).

## Rationale

- Free entry grows the catalog and separates dodai from paid clones.
- Category exclusivity channels competitive urgency into a clear product: “we are the sponsor of CRM this week.”
- Home can host several equal sponsors; category cannot without inventing fake rank.

## Consequences

- Product definition / offer / FAQ must say base is free (overrides earlier 100 UAH copy).
- Submit flow: no charge for base listing when `BASE_LISTING_PRICE_UAH === 0`.
- Accepting ADR closes pricing open items except provider choice.
