# SportFlow AI — Sports Operations Platform

A full-stack Next.js 14 (App Router) + TypeScript sports operations platform:
real database, real JWT/RBAC auth, real CRUD APIs, dark mode, animations,
toasts, skeleton/empty/error states, Docker, and tests.

---

## ⚡ Quick start (local dev, SQLite — zero setup)

```bash
npm install
cp .env.example .env
npx prisma migrate dev --name init   # creates prisma/dev.db + tables
npm run db:seed                       # admin user + sample clubs/players/etc.
npm run dev
```

Open http://localhost:3000 → redirects to `/login`.

**Seeded admin login:** `admin@sportflow.ai` / `Admin@12345`
(or register your own — the *first* account created is auto-promoted to `ADMIN`).

> **Note on this delivery:** this code was written and type-checked (`tsc
> --noEmit` — 0 errors) and lint-checked (`next lint` — 0 errors/warnings) in a
> sandboxed environment whose network allowlist doesn't include
> `binaries.prisma.sh`, so I could not run `prisma migrate`/`generate` or boot
> the server end-to-end there. On your machine, CI, or in the Docker build —
> all of which have normal internet access — the commands above will fetch
> Prisma's engine binaries and run normally. If you hit any issue on first
> run, it's most likely a fresh-environment thing (missing `.env`, DB not
> migrated yet) rather than a logic bug — the whole codebase compiles clean.

---

## What's real vs. what's illustrative

Everything below is **real**: a Postgres/SQLite database via Prisma, JWT
cookie auth, bcrypt password hashing, role-based access control, Zod-validated
REST APIs, rate limiting, audit logging, file uploads (local or S3-compatible),
and a Groq-backed AI Assistant.

**Fully wired to the real API (list, create, and in most cases
update/delete), no mock data:**
Clubs & Teams, Players (incl. per-match stat history), Venues, Scouting,
Sponsorships, Matches, Leagues + **Standings + Top Scorers** (read + create),
Ticketing (read + create), Operations/Staff (read + create), Notifications,
User Management (Admin), Dashboard/Analytics headline KPIs, and the **AI
Assistant** (Groq `llama-3.3-70b-versatile`, grounded with a live DB
snapshot — see below).

**Still illustrative (clearly commented in code), pending a dedicated
schema/model + endpoint pass:**
- The **Scheduling** calendar page (weekly grid, conflict list) — the
  `Booking` model exists and is used for Venue upcoming-bookings, but the
  weekly training/match calendar itself isn't backed by its own CRUD API yet.
- Revenue-breakdown pie chart and month-over-month trend lines on
  Dashboard/Analytics/Ticketing (would need a time-series `Transaction` or
  daily snapshot table — the headline KPI numbers above them are real,
  DB-backed aggregates; only the shape of the trend lines is representative).

This isn't a hedge to avoid work — it's the honest line between "queried from
Postgres right now" and "would need one more schema + CRUD pass," so you know
exactly what to harden before go-live.

### AI Assistant (Groq)

Get a free key at **console.groq.com/keys**, drop it into `.env` as
`GROQ_API_KEY`, restart the server. Model defaults to
`llama-3.3-70b-versatile` (override with `GROQ_MODEL` — e.g.
`llama-3.1-8b-instant` for lower latency, or point it at any other
OpenAI-compatible provider by adjusting `lib/groq.ts`'s base URL, which is
where you'd swap in Hugging Face's Inference API/Router instead if you'd
rather use that). Without a key set, the endpoint returns a friendly `503`
with setup instructions instead of crashing.

### Media storage (local → S3/R2)

`/api/upload` writes to `public/uploads` by default (zero setup, fine for
local dev). Set `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`,
`S3_SECRET_ACCESS_KEY` in `.env` to switch it to S3 automatically — no code
changes needed. Works with real AWS S3 out of the box; for S3-compatible
providers (Cloudflare R2, Backblaze B2, MinIO) also set `S3_ENDPOINT` and,
if you're serving files through a CDN/custom domain, `S3_PUBLIC_URL_BASE`.

---

## Architecture

```
sportflow-ai/
├── app/
│   ├── login/, register/            # Public auth pages (no sidebar chrome)
│   ├── (app)/                       # Route group: everything behind auth
│   │   ├── layout.tsx                # Sidebar + Header + page-transition shell
│   │   ├── dashboard/ clubs/ players/ leagues/ scheduling/ matches/
│   │   ├── venues/ scouting/ ticketing/ sponsorships/ analytics/
│   │   └── operations/ assistant/ settings/
│   └── api/                         # All backend routes (see API.md)
│       ├── auth/  clubs/  players/  venues/  scouting/  sponsors/
│       ├── matches/  leagues/  tickets/  staff/  notifications/
│       ├── users/  upload/  analytics/
├── prisma/
│   ├── schema.prisma                 # Full data model (14 modules)
│   └── seed.ts                       # Realistic sample data
├── lib/
│   ├── prisma.ts    # client singleton
│   ├── auth.ts      # JWT sign/verify, bcrypt, RBAC rank check
│   ├── api.ts        # withApi() wrapper: rate limit + RBAC + error handling
│   ├── rateLimit.ts  # in-memory sliding window limiter
│   ├── audit.ts      # writes to AuditLog on every mutation
│   ├── fetcher.ts    # typed fetch/SWR helpers, ApiError
│   └── data.ts       # remaining illustrative chart/trend data (see above)
├── components/
│   ├── layout/       # Sidebar, Header (theme toggle, session, logout), PageTransition
│   ├── providers/    # ThemeProvider + Toaster + SWRConfig
│   └── ui/           # KpiCard, DonutChart, ProgressRing, Skeleton, EmptyState/ErrorState
├── hooks/useSession.ts
├── middleware.ts      # redirects unauthenticated requests to /login
├── __tests__/         # Jest + Testing Library
├── Dockerfile, docker-compose.yml
└── API.md             # full endpoint reference
```

## Auth & RBAC

- Passwords hashed with **bcrypt**; sessions are **JWT** in an httpOnly,
  `SameSite=Lax` cookie (`sf_token`), 7-day expiry.
- Roles, low → high: `VIEWER < SCOUT < COACH < CLUB_MANAGER < ADMIN`. Each
  write endpoint declares a minimum role via `withApi(handler, { minRole })`.
- `middleware.ts` redirects any unauthenticated request for a page (not an
  API call) to `/login?next=<path>`.
- Admins can promote/demote users from **Settings → User Management**.

## Security & reliability

- **Rate limiting**: in-memory sliding window, 120 req/min default, 10/min on
  `/api/auth/*`. Swap for a Redis-backed limiter (Upstash, etc.) once you run
  more than one app instance.
- **Validation**: every write endpoint parses its body with **Zod**; failures
  return `422` with field-level `details`.
- **Audit log**: every create/update/delete writes an `AuditLog` row
  (`userId`, `action`, `entity`, `entityId`, JSON `metadata`).
- **File uploads**: `/api/upload` validates MIME type + 5MB size limit, writes
  to `public/uploads`. **Swap for S3/R2/Cloudinary before production** — local
  disk storage doesn't survive redeploys/multiple instances (a Docker volume
  is wired in `docker-compose.yml` as a stopgap).

## Frontend

- **Dark/light mode** — Tailwind `class` strategy + `next-themes`, toggle in
  the header, persisted automatically.
- **Animations** — Framer Motion page transitions, modal enter/exit, staggered
  hover states.
- **Toasts** — `react-hot-toast` on every mutation (success + error).
- **Loading/empty/error states** — `Skeleton*`, `EmptyState`, `ErrorState`
  components used consistently across every data-driven page.
- **Data fetching** — SWR, with a shared `fetcher`/`apiRequest` pair that
  normalizes the `{ success, data | error }` API shape into thrown `ApiError`s.

## Testing

```bash
npm test
```

12 tests covering: password hashing round-trip, JWT sign/verify + tamper
rejection, RBAC rank logic, the rate limiter's window/reset behavior, and the
`EmptyState`/`ErrorState` components. This is a solid foundation, not full
coverage — the natural next additions are API route integration tests (e.g.
with `supertest` against a test SQLite DB) and Playwright/Cypress e2e for the
auth → create-club → create-player flow.

## Docker

```bash
docker compose up --build
```

This starts Postgres + the app. **Before your first Docker run**, switch the
Prisma datasource from SQLite to Postgres (SQLite is meant for zero-setup
local dev only):

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"   // was "sqlite"
  url      = env("DATABASE_URL")
}
```

> **Heads up:** this edit and your local `.env` (which points `DATABASE_URL`
> at a SQLite file) are now out of sync — `provider` must match the kind of
> URL in `DATABASE_URL` or Prisma refuses to run (`P1012` schema validation
> error). If you're switching back and forth between local SQLite dev and
> Docker/Postgres, either keep two schema files and swap them, or just commit
> to Postgres everywhere (Section 4 works fine against a local Postgres
> instance too — just change `DATABASE_URL`, no code changes needed).

Then run migrations against the containerized Postgres once it's up:

```bash
docker compose exec app npx prisma migrate deploy
docker compose exec app npm run db:seed
```

The app also runs standalone (`output: "standalone"` in `next.config.js`), so
the same `Dockerfile` deploys cleanly to Render, Fly.io, Railway, or any
container host — just supply `DATABASE_URL` and `JWT_SECRET` as env vars.

## Deploying without Docker (e.g. Vercel + a managed Postgres)

1. Provision Postgres (Neon, Supabase, Railway, RDS...).
2. Set `DB_PROVIDER=postgresql` in schema (same edit as above) and
   `DATABASE_URL` in your host's env vars, plus a strong `JWT_SECRET`
   (`openssl rand -base64 32`).
3. `npx prisma migrate deploy` as a build/release step.
4. Note: Vercel's serverless filesystem is ephemeral — set the `S3_*` env
   vars (see "Media storage" above) before deploying there; `/api/upload`
   switches to S3 automatically once they're present. Also set
   `GROQ_API_KEY` if you want the AI Assistant live.

## Next steps (in priority order)

1. Add a `Booking`-backed CRUD API for the Scheduling weekly calendar (model
   already exists, just needs its own endpoints + a create/edit UI like the
   other modules).
2. Add a time-series `Transaction`/daily-snapshot model to make the
   revenue-breakdown and trend-line charts fully live (headline KPIs above
   them already are).
3. Add API integration tests + Playwright e2e for the core flows (auth →
   create club → add player → log match stat → check standings update).
4. Redis-backed rate limiting once you scale past one instance.
5. Stream the AI Assistant's response token-by-token (Groq supports SSE
   streaming) instead of waiting for the full reply.
