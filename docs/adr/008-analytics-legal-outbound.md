# ADR 008 — Analytics, legal pages, outbound redirects

- Status: Accepted
- Date: 2026-09-18
- Relates to: ADR 001, ADR 003

## Context

Stage 6 needs product analytics, legal surfaces for MVP launch, and safe outbound tracking without open redirects.

## Decision

1. Use PostHog when `NEXT_PUBLIC_POSTHOG_KEY` is set; otherwise log approved events to the console in development and no-op in production clients.
2. Only emit events from the approved vocabulary in `lib/analytics/events.ts`. Payloads exclude emails and free-text private fields.
3. Ship `/legal/offer` and `/legal/privacy` with honest MVP copy; operator legal entity details remain subject to legal review before live charges.
4. Outbound product links go through `/go/[id]` with product-domain allowlist + SSRF host checks, `noindex`, and robots disallow (already listed).
5. Accessibility baseline: skip link to `#main-content`, `lang="uk"`, visible focus, min 44px controls retained; fonts use `display: swap` for CWV.

## Consequences

- Analytics is optional per environment and does not block catalog use.
- `/go/*` never becomes an open redirect.
- Full fiscalization / company requisites wait for legal sign-off (ADR 001 note unchanged).
