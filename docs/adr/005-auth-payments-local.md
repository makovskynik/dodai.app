# ADR 005 — Auth + payments without Neon (stage 3)

- Status: Accepted (temporary bridges)
- Date: 2026-09-18

## Decision

1. **Auth**: signed JWT cookie + magic-link tokens in `.data/magic-links.json`. Resend is optional; in development the verify URL is returned as preview.
2. **Admin**: emails listed in `ADMIN_EMAILS` (default `admin@dodai.app`).
3. **Payments**: `PaymentProvider` interface with `local` (default), `monobank`, `wayforpay` adapters. Webhook is the source of truth; handlers are idempotent.
4. **Moderation**: paid submissions enter `/admin` queue. Approve runs GEO publish gate, then writes to `.data/published.json` overlay merged into the catalog.
5. When Neon is connected: migrate submissions/payments/users into Postgres; keep the same provider interfaces.

## Security notes

- `AUTH_SECRET` required in production.
- `/admin` and `/account` protected by middleware.
- Do not treat local payment provider as production-ready.
