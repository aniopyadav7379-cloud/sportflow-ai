# SportFlow AI — API Reference

All endpoints are served from the Next.js app itself under `/api`. Responses
always follow this shape:

```json
{ "success": true, "data": { ... } }
{ "success": false, "error": "message", "details": { ... } }
```

Authentication is a JWT stored in an **httpOnly cookie** (`sf_token`) set by
`/api/auth/login` and `/api/auth/register`. There is no `Authorization` header
required from the browser — `fetch` calls just need `credentials: "include"`.

## Roles (RBAC)

`VIEWER < SCOUT < COACH < CLUB_MANAGER < ADMIN`. Each endpoint below lists the
**minimum** role required for write operations. Reads generally only require
being logged in. The first account ever registered becomes `ADMIN`
automatically; everyone after defaults to `VIEWER` (an Admin can promote users
from Settings → User Management).

Every route is also rate-limited (in-memory, per-IP) — default 120 req/min,
tighter (10 req/min) on `/api/auth/*`.

---

## Auth

| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password }` | First user becomes ADMIN |
| POST | `/api/auth/login` | `{ email, password }` | Sets `sf_token` cookie |
| POST | `/api/auth/logout` | — | Clears cookie |
| GET  | `/api/auth/me` | — | Current session |

## Clubs

| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/api/clubs?q=` | any | Search by name |
| POST | `/api/clubs` | CLUB_MANAGER | |
| GET | `/api/clubs/:id` | any | Includes teams, players, venues |
| PATCH | `/api/clubs/:id` | CLUB_MANAGER | |
| DELETE | `/api/clubs/:id` | ADMIN | |
| POST | `/api/clubs/:id/teams` | CLUB_MANAGER | Create a team under a club |

## Players

| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/api/players?q=&clubId=&page=&pageSize=` | any | Paginated |
| POST | `/api/players` | COACH | |
| GET | `/api/players/:id` | any | |
| PATCH | `/api/players/:id` | COACH | |
| DELETE | `/api/players/:id` | CLUB_MANAGER | |

## Venues

| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/api/venues?type=` | any | |
| POST | `/api/venues` | CLUB_MANAGER | |
| GET | `/api/venues/:id` | any | Includes bookings |
| PATCH | `/api/venues/:id` | CLUB_MANAGER | |
| DELETE | `/api/venues/:id` | ADMIN | |

## Scouting

| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/api/scouting?stage=` | any | Prospect/Shortlisted/OnTrial/Signed/Rejected |
| POST | `/api/scouting` | SCOUT | |
| GET | `/api/scouting/:id` | any | |
| PATCH | `/api/scouting/:id` | SCOUT | Move stage, update rating |
| DELETE | `/api/scouting/:id` | CLUB_MANAGER | |

## Sponsors

| Method | Path | Role |
|---|---|---|
| GET | `/api/sponsors` | any |
| POST | `/api/sponsors` | CLUB_MANAGER |
| GET / PATCH | `/api/sponsors/:id` | any / CLUB_MANAGER |
| DELETE | `/api/sponsors/:id` | ADMIN |

## Matches

| Method | Path | Role |
|---|---|---|
| GET | `/api/matches?status=` | any |
| POST | `/api/matches` | COACH |
| GET / PATCH | `/api/matches/:id` | any / COACH |
| DELETE | `/api/matches/:id` | CLUB_MANAGER |

## Standings & Top Scorers

| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/api/leagues/:id/standings` | any | Ordered by points desc |
| POST | `/api/leagues/:id/standings` | CLUB_MANAGER | Upserts a team's row (unique on `leagueId+team`) — `{ team, played, won, drawn, lost, goalsFor, goalsAgainst, points, form: ["W","D","L"] }` |
| GET | `/api/leagues/:id/top-scorers` | any | Derived via `groupBy` over `PlayerMatchStat`, joined to `Match.leagueId` |

## Player Match Stats

| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/api/players/:id/stats?limit=` | any | Most recent first, powers the profile's performance chart + recent matches table |
| POST | `/api/players/:id/stats` | COACH | `{ opponent, date, scoreLine, rating, goals, assists, minutes }` — also increments the player's season `matches/goals/assists` totals |

## Leagues, Tickets, Staff (read + create)

| Method | Path | Role |
|---|---|---|
| GET / POST | `/api/leagues` | any / CLUB_MANAGER |
| GET / POST | `/api/tickets` | any / CLUB_MANAGER |
| GET / POST | `/api/staff?department=` | any / CLUB_MANAGER |

## Notifications

| Method | Path | Notes |
|---|---|---|
| GET | `/api/notifications` | Current user's notifications |
| PATCH | `/api/notifications` | `{ id, read }` — mark read/unread |

## Users (Admin)

| Method | Path | Role |
|---|---|---|
| GET | `/api/users` | ADMIN |
| PATCH | `/api/users/:id` | ADMIN — `{ role }` |

## Uploads

| Method | Path | Role | Notes |
|---|---|---|---|
| POST | `/api/upload` | SCOUT | `multipart/form-data`, field `file`. 5MB limit, image types only. Returns `{ url, backend }` — `backend` is `"s3"` when `S3_BUCKET`+credentials are set in env, otherwise `"local"` (writes to `public/uploads`, fine for dev, not durable in production). |

## AI Assistant

| Method | Path | Role | Notes |
|---|---|---|---|
| POST | `/api/assistant` | any (VIEWER+) | `{ messages: [{ role: "user"|"assistant", content }] }` (last 10 kept). Calls Groq's OpenAI-compatible chat completions API (`llama-3.3-70b-versatile` by default), grounded with a live snapshot of clubs/players/matches/venue utilization pulled from the DB in the system prompt. Returns `{ reply }`. Requires `GROQ_API_KEY` in env — returns a friendly `503` with setup instructions if it's missing rather than a raw error. Rate-limited to 20 req/min. |

## Analytics

| Method | Path | Notes |
|---|---|---|
| GET | `/api/analytics` | Aggregate counts powering the Dashboard/Analytics pages |

---

## Error codes

| Status | Meaning |
|---|---|
| 400 | Bad request |
| 401 | Not authenticated |
| 403 | Authenticated but insufficient role |
| 404 | Not found |
| 409 | Conflict (e.g. duplicate email) |
| 413 | Payload too large (uploads) |
| 415 | Unsupported file type (uploads) |
| 422 | Validation failed — `details` has the Zod field errors |
| 429 | Rate limited |
| 500 | Internal server error |
