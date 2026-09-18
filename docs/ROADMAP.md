# Roadmap — етапи dodai.app

Оновлено: 2026-09-18. SEO + GEO закладені з етапу **1.5**.

| Етап | Статус | Зміст |
|---|---|---|
| **0** Foundation | done | Next.js, design tokens, shell UI, rules, ADR stack |
| **1** Catalog | done | Neon/Drizzle schema, local seed, search/filters |
| **1.5** SEO + GEO foundations | done | robots, sitemap, OG/canonical, JSON-LD, llms.txt, citable facts, schema fields |
| **2** Submit | done | URL-first form, safe metadata fetch, SEO fields, local `.data` inbox until Neon |
| **3** Auth + pay + moderation | done | Magic link, PaymentProvider (local/mono/WFP), GEO publish gates, admin queue |
| **4** Map + placements | done | SVG map, inventory, sponsored blocks (inventory-driven) |
| **5** Votes + Product of the Week | done | Launches, anti-fraud, immutable weekly awards (editorial until threshold) |
| **6** Analytics + legal + QA | done | PostHog events, оферта/privacy, CWV/a11y basics, `/go` allowlist |
| **7** GEO content scale | done | Category intros, `/collections/*`, FAQ, claim + verification dates |
| **8** After launch | later | Owner digests, EN locale, public read API, reviews |

## SEO / GEO checklist by stage

### Must ship in 1.5
- [x] `robots.ts` + AI crawler allowlist
- [x] `sitemap.ts` for indexable URLs only
- [x] Canonical + OG + Twitter helpers
- [x] JSON-LD Organization / WebSite / Breadcrumb / SoftwareApplication / ItemList
- [x] `llms.txt` + `llms-full.txt`
- [x] Citable facts on product page
- [x] DB fields for seoTitle, seoDescription, lastVerifiedAt, sameAs, category intro

### Must include in stage 2 (submit)
- [x] Require tagline ≤ 90 chars
- [x] Collect platforms, pricing model, UA connection, city
- [x] Optional seoTitle / seoDescription overrides
- [x] Preview of public title/description before pay
- [x] SSRF-safe metadata fetch
- [x] Local submission store until Neon is connected

### Must include in stage 3 (moderation)
- [x] Block publish without tagline + platforms + ukraineNote
- [x] Set `lastVerifiedAt` on approve
- [x] noindex until status = active (only approved overlay enters catalog)
- [x] Payment webhook idempotency
- [x] Local mock checkout + Monobank/WayForPay adapters

### Must include in stage 4 (map + placements)
- [x] SVG map with city clusters + accessible list alternative
- [x] Placement inventory with starts/ends/surface/status
- [x] Overlap guard for same surface+slot
- [x] Sponsored blocks driven by live catalog placements
- [x] Map highlight independent of marker size / organic rank
- [x] No invented slot prices

### Must include in stage 5 (votes + Product of the Week)
- [x] Launch windows with open/closed status
- [x] One vote per authenticated user per launch
- [x] Immutable weekly awards (editorial source by default; `award_date` = Kyiv week Monday)
- [x] VoteControl on cards/product pages; login required
- [x] Votes independent of payment / placements
- [x] No invented editorial→votes threshold switch

### Must include in stage 6 (analytics + legal + QA)
- [x] PostHog provider + approved event vocabulary
- [x] Wire core events (search, filter, product_opened, outbound, vote, submit)
- [x] `/legal/offer` + `/legal/privacy`
- [x] `/go/[id]` redirect allowlist + noindex + robots disallow
- [x] Skip link + main landmark; font display swap

### Must include in stage 6–7
- [x] `/go/[id]` redirect allowlist + noindex + robots disallow
- [x] Category pages with intro text (min N products)
- [x] Editorial collections for task queries (CRM для ФОП, etc.)
- [x] FAQ schema on home / about
- [x] Monitor zero-result searches → new collection ideas

### Must include in stage 7 (GEO content scale)
- [x] `/categories` index + intro-gated indexability
- [x] `/collections` + task collections
- [x] `/about` with FAQ
- [x] Claim form + lastVerifiedAt surface
- [x] Persist zero-result searches with collection suggestions

## Open product decisions (do not invent)
- Final payment provider (Monobank vs WayForPay)
- Accept / revise ADR 010 tariff amounts after `/pricing` review
- Threshold to switch Product of the Week from editorial to voting
