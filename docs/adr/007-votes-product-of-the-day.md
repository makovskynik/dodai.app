# ADR 007 — Votes + Product of the Week

- Status: Accepted (amended 2026-09-18)
- Date: 2026-09-18
- Relates to: ADR 001, ADR 006

## Context

Stage 5 needs organic voting and an immutable weekly award. Product rules forbid selling votes or buying Product of the Week. The threshold to switch the award from editorial selection to vote winners remains an open product decision.

Cadence was amended from daily («Продукт дня») to weekly («Продукт тижня») to match discovery attention and launch windows.

## Decision

1. **Launches** are time-bounded voting windows per product (`scheduled` / `open` / `closed`).
2. **Votes** require a signed-in magic-link session; unique constraint `(launch_id, voter_email)` enforces one vote per user per launch.
3. Basic anti-fraud: auth required, email normalized, per-email rate limit, unique DB index.
4. **Awards** use DB type key `product_of_the_day` (schema-stable) with `award_date` = **Monday of the Kyiv week** (`YYYY-MM-DD`). Awards are insert-only / immutable; owners cannot edit them. Product UI label is «Продукт тижня».
5. Until the threshold decision, Product of the Week is **editorial-only** via awards. Vote counts are recorded but do not auto-create awards.
6. Paid placements never receive the weekly award badge; votes never change organic ranking by payment.
7. Local in-memory fallback mirrors Neon when the votes schema is unavailable.
8. Public route is `/product-of-the-week`; `/product-of-the-day` permanently redirects.

## Consequences

- `/api/votes` is the only cast path; UI VoteControl redirects anonymous users to login.
- Seed creates this week's editorial award and demo open launches.
- Switching award source to `votes` needs an explicit product decision + code change.
