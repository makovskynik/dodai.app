# ADR 009 — GEO content scale

- Status: Accepted
- Date: 2026-09-18
- Relates to: ADR 003, ADR 008

## Context

Stage 7 expands citable surfaces: category intros, task collections, FAQ, claim/verification, and zero-result monitoring for future taxonomy.

## Decision

1. Category pages are indexable only with non-empty `introUk` and ≥ `CATEGORY_INDEX_MIN_PRODUCTS` products.
2. Editorial `/collections/*` answer task queries; organic and sponsored remain separate blocks; thin collections are `noindex`.
3. Shared `PLATFORM_FAQ` powers visible FAQ on `/about` and FAQPage JSON-LD on home + about.
4. Zero-result searches persist to `.data/zero-result-searches.json` with suggested collection slugs.
5. Claimable editorial cards expose a claim form; requests store locally for moderation. Verification date remains `lastVerifiedAt` on the product page.

## Consequences

- Sitemap includes indexable categories, collections, `/about`, `/categories`, `/collections`.
- New collection ideas can be derived from zero-result logs without inventing SEO thin pages.
- Claim approval workflow can later write to Neon; MVP is local inbox.
