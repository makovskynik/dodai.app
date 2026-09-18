# ADR 001 — Platform stack (Vercel + Neon)

- Status: Accepted
- Date: 2026-09-18
- Decides: hosting, database, auth, files, jobs, payments

## Context

Product docs and early Cursor rules assumed Supabase (Postgres + Auth + Storage + Cron).
Project constraints from the product owner:

- Deploy on **Vercel**
- Database on **Neon**
- Payments via **WayForPay** and/or **Monobank** (final provider TBD; adapter required)

## Decision

| Layer | Choice |
|---|---|
| App | Next.js App Router + TypeScript on Vercel |
| Database | Neon Postgres (`@neondatabase/serverless` + Drizzle ORM) |
| Auth | Auth.js (NextAuth) magic link via Resend (not Supabase Auth) |
| Files | Vercel Blob (or Cloudflare Images later if needed) |
| Cron / jobs | Vercel Cron + Route Handlers (Inngest only if complexity grows) |
| Payments | `PaymentProvider` interface; first adapter: Monobank **or** WayForPay |
| Validation | Zod at every external boundary |
| Analytics | PostHog (+ GA if approved) |

## Consequences

- Cursor rules that mention Supabase Auth / RLS / Storage / Cron are overridden by this ADR until those sections are rewritten.
- Authorization is enforced in server code and Postgres policies/constraints; RLS may be added later via Neon roles if needed.
- Payment webhook remains the only source of truth for paid status (unchanged product invariant).

## Open

- Exact payment provider for MVP (Monobank vs WayForPay vs both behind adapter).
- Fiscalization / receipts — legal review before live charges.
