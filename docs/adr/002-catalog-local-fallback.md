# ADR 002 — Stage 1 catalog data source

- Status: Accepted
- Date: 2026-09-18
- Relates to: ADR 001

## Context

Stage 1 needs a working catalog before Neon credentials are always available in every environment.

## Decision

1. Ship a typed **local seed** derived from `data/marketer-products-seed.json`.
2. Use the same filter/search helpers for local and Neon-backed queries.
3. If `DATABASE_URL` is missing or the DB query fails, fall back to the local seed.
4. Persist schema via Drizzle migrations in `drizzle/`.
5. Seed Neon with `npm run db:seed` when a connection string is present.

## Consequences

- UI and SEO pages work offline / without Neon during development.
- Production should set `DATABASE_URL` and run migrations + seed.
- Editorial badges (`product-of-the-day`) remain seed markers until voting lands.
- Demo `promoted` comes from local/DB placement inventory (ADR 006), not organic sort.
