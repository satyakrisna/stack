# STACK

STACK is a mobile-first consistency application: you are not tracking habits; you are stacking proof. Each completion is permanent proof, while consecutive successful daily or weekly periods form the current stack.

## Technology and architecture

Next.js 15 App Router, React 19, TypeScript, PostgreSQL on Neon, Drizzle ORM, Zod, and a responsive installable PWA. It is a modular monolith: React server components read data, server actions own mutations and authorization, and pure functions in `lib/` calculate dates and metrics.

Authentication uses bcrypt (cost 12) credentials, opaque random session tokens stored only as SHA-256 hashes, HTTP-only SameSite cookies (`Secure` and `__Host-` prefixed in production), expiring verification/reset tokens, and server-side ownership checks. In development, email URLs are logged by the email adapter. Production refuses to send unless its webhook provider variables are configured.

## Setup

```bash
npm install
cp .env.example .env.local
npm run db:migrate
npm run db:seed # optional demo data
npm run dev
```

### Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Existing pooled Neon PostgreSQL connection URL |
| `APP_URL` | Yes in production | Public canonical URL used in email links |
| `EMAIL_FROM` | Required in production | Verified sender address |
| `EMAIL_WEBHOOK_URL` | Required in production | Transactional email adapter endpoint |
| `EMAIL_WEBHOOK_SECRET` | Required in production | Bearer credential for that endpoint |

Never expose these as `NEXT_PUBLIC_*`. Seed credentials are `demo@stack.local` / `stackproof` and are development-only.

## Commands

```bash
npm run db:generate  # generate migrations from schema
npm run db:migrate   # apply checked-in migrations to Neon
npm run db:seed      # representative local/dev data
npm run test
npm run lint
npm run typecheck
npm run build
```

The entry table has a database-level unique index on `(stack_id, entry_date)`, making repeat and concurrent completion requests idempotent. `entry_date` is derived from the user's IANA timezone. Current streak calculations allow the active day/week to remain unfinished; only a completed prior period can extend a streak. Best streak, lifetime proof, and eligible-period stack rate are calculated from authoritative entries rather than mutable counters.

## Routes

Authentication: `/`, `/register`, `/login`, `/forgot-password`, `/reset-password`, `/verify-email`. Onboarding: `/onboarding`, `/onboarding/timezone`. Product: `/`, `/stack/new`, `/stack/[id]`, `/history`. System: `/settings`, `/settings/account`, `/install`, `/offline`.

## PWA installation

The manifest, theme metadata, maskable SVG icon, production service worker, offline navigation fallback, standalone detection, native install prompt, and iOS Share → Add to Home Screen instructions are included. Safari users can install from Share; supporting Chromium browsers show a native install action. Authenticated pages are network-only and are never written to the service-worker cache.

## Vercel deployment

1. Import this Git repository into the existing Vercel project.
2. Keep the existing Neon integration and set `DATABASE_URL` for Production, Preview, and Development as appropriate.
3. Set `APP_URL` to the production HTTPS domain and configure `EMAIL_FROM`, `EMAIL_WEBHOOK_URL`, and `EMAIL_WEBHOOK_SECRET` for the chosen provider adapter.
4. Run `npm run db:migrate` once against the production Neon branch (prefer a deployment migration job or a controlled local invocation).
5. Use the default framework preset and `npm run build`; no custom server or writable filesystem is required.
6. Deploy, create an account, verify email delivery, set timezone, complete a stack, and install the PWA.

Full offline mutation synchronization, notifications, custom schedules, and third-party health integrations are intentionally outside V1.
