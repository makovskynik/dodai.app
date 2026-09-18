# dodai.app

Каталог українських цифрових продуктів.

## Current stage

**3 Auth + pay + moderation** — works without Neon.

Default payment provider: `local` (mock checkout).  
Default admin email: `admin@dodai.app` (magic link).

```bash
npm run dev
# 1) /submit → pay → simulate payment
# 2) /login as admin@dodai.app → /admin → approve
```

When Neon is ready: set `DATABASE_URL`, `npm run db:push && npm run db:seed`.  
Payments/auth interfaces stay the same (`PAYMENT_PROVIDER=monobank|wayforpay`).

See `docs/ROADMAP.md`.
