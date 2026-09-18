# ADR 003 — SEO + GEO foundations

- Status: Accepted
- Date: 2026-09-18
- Relates to: ADR 001, ADR 002

## Context

Classic SEO is required in the MVP plan. GEO (visibility in ChatGPT, Perplexity, Gemini, Google AI Overviews) was not an explicit stage. Retrofitting schema, crawler policy and citable product facts later is expensive.

## Decision

### Indexation rules

| Surface | Index |
|---|---|
| `/`, active product pages, categories with intro + enough products | yes |
| `/products` without thin filter-only variants | yes (canonical clean URL) |
| Filter query strings (`?q=&platform=`) | noindex via robots meta when filters active |
| `/submit`, `/account/*`, `/admin/*`, `/go/*`, drafts, rejected, archived | noindex + disallow where relevant |

### Technical deliverables (shipped in stage 1.5)

- `app/robots.ts` — allow public catalog; disallow private/redirect routes; allow major AI crawlers
- `app/sitemap.ts` — home, catalog, product-of-the-day, active products, indexable categories
- Canonical + Open Graph + Twitter metadata helpers
- JSON-LD: `Organization`, `WebSite` (+ SearchAction), `BreadcrumbList`, `SoftwareApplication` / `WebApplication`, `ItemList`
- `public/llms.txt` and `public/llms-full.txt`
- Citable fact block on product pages (platforms, category, UA note, verified date, pricing model)

### Data model additions

Products gain: `seoTitle`, `seoDescription`, `ukraineNote` (already), `lastVerifiedAt`, `sameAs` (text array), `faqJson` (optional later).

Categories gain: `introUk`, `seoTitle`, `seoDescription`, `indexable` (boolean; true only with intro + min products).

### Outbound links

Paid / commercial outbound links remain `rel="sponsored nofollow noopener"`. Editorial unpaid links may be normal after human review (product rule unchanged).

### AI crawlers

Default: allow GPTBot, ChatGPT-User, ClaudeBot, Anthropic-AI, PerplexityBot, Google-Extended, Applebot-Extended. Change only via a new ADR.

## Consequences

- Stage roadmap includes ongoing SEO/GEO work (collections, category intros, verification dates, `/go` noindex).
- Submit/moderation must require GEO-critical fields before `active`.
- Empty categories must not enter the sitemap.
