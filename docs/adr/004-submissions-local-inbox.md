# ADR 004 — Submissions without Neon (temporary)

- Status: Accepted (temporary)
- Date: 2026-09-18

## Context

Stage 2 needs a working `/submit` flow before Neon credentials are available.

## Decision

1. Metadata fetch runs in Node route handlers with SSRF protections.
2. Validated submissions are appended to `.data/submissions.json` (gitignored).
3. Catalog continues to use local seed JSON when `DATABASE_URL` is absent.
4. When Neon is connected, stage 3 migrates this inbox into `submissions` / `products` tables and adds payment + magic link.

## Consequences

- Local/dev/demo environments work offline.
- Do not deploy stage 2 submission inbox as the long-term production store without Neon.
- `.data/` must stay out of git.
