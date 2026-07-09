# AffilTrak

A single-page affiliate marketing dashboard demo with a dark fintech-style UI showing profile, package tier, and rolling earnings (today / 7-day / 30-day / all-time), plus a no-auth admin panel for editing profile and earnings.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, mounted at `/api`)
- `pnpm --filter @workspace/affiltrak run dev` — run the AffilTrak web app (port 20714, mounted at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite, react-hook-form, sonner (toasts)

## Where things live

- `lib/api-spec/openapi.yaml` — source-of-truth API contract (GET /dashboard, PUT /admin/profile, PUT /admin/earnings)
- `lib/db/src/schema/profile.ts`, `lib/db/src/schema/earnings.ts` — DB schema (profile table; daily earning ledger keyed by unique `earningDate`)
- `artifacts/api-server/src/lib/earnings.ts` — computes today/7-day/30-day/all-time sums from the ledger; `setTodayEarning` upserts today's row
- `artifacts/api-server/src/lib/profile.ts` — profile get-or-create with defaults, and update
- `artifacts/affiltrak/src/App.tsx` — public dashboard page
- `artifacts/affiltrak/src/pages/Admin.tsx` — admin panel (`/admin`, no auth)
- `artifacts/affiltrak/src/hooks/use-withdrawal-toasts.ts` — simulated withdrawal toast (client-side only, random name/phone/amount every 30s)

## Architecture decisions

- Earnings cascade forward only, never backward: `today` comes from the daily ledger; `sevenDay = today + sevenDayExtra`; `thirtyDay = sevenDay + thirtyDayExtra`; `allTime = thirtyDay + allTimeExtra`. The `*Extra` values live in the singleton `earnings_adjustments` table (`artifacts/api-server/src/lib/earnings.ts`).
  - Editing `today` changes a value every other bucket is built on, so 7-day/30-day/all-time all shift by the same amount automatically.
  - Editing `sevenDay`/`thirtyDay`/`allTime` only solves for that bucket's own `*Extra` (so larger windows cascade forward) and never touches a smaller window. This was a deliberate fix for a bug where editing 7-day/30-day used to silently change "today" too.
- Admin sets an **absolute** value for today's earning (not a delta); the ledger row for today is upserted.
- The withdrawal toast is purely client-side/simulated (random Indian name, masked phone, ₹5,000–₹37,000 amount) — no backend involvement, per requirements.
- No authentication on `/admin` — this is a personal single-user tool, not multi-tenant.

## Product

- Public dashboard (`/`): profile card (photo, name, ID, package badge) + 4 earning cards (Today / Last 7 Days / Last 30 Days / All Time), each with a count-up animation from 0 on every page load.
- Admin panel (`/admin`, no login): edit profile fields (name, affiliate ID, package tier, photo URL) and set today's absolute earning amount; other totals recompute automatically.
- Every 30 seconds, a toast slides up from the bottom announcing a simulated withdrawal with a random Indian name, masked phone number, and amount.

## User preferences

- Keep scope minimal: single public page + single admin page, no auth, no extra features beyond what was requested.
- Match the reference screenshots closely (dark fintech aesthetic, gradient earning cards).

## Gotchas

- Workflow names in this project are `<artifact-dir>: <service-name>` (e.g. `artifacts/affiltrak: web`), not the artifact's display title — use `listWorkflows()` to confirm before calling `restart_workflow`.
- `photoUrl` form field can be `null` from the API; bind `value={field.value ?? ""}` in the admin form to avoid a controlled-input type error.

## Setup status (imported project)

- Dependencies installed (`pnpm install`), DB schema pushed (`pnpm --filter @workspace/db run push`) against the pre-provisioned `DATABASE_URL`.
- Artifact workflows registered and running: `artifacts/api-server: API Server` (port 8080) and `artifacts/affiltrak: web` (port 20714, mounted at `/`).
- Seeded profile/earnings via the admin API to match the user's reference screenshots: name "Arman", affiliate ID `GK-8749513`, "Silver Package", today's earning ₹176.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
