# Workout Calendar

A multi-profile functional strength training planner built with Next.js, React, Prisma, and PostgreSQL. Designed for use on both a phone and a dedicated garage display (27" monitor or Apple TV).

## Features

- **Today screen** — quick-start the day's workout, streak and weekly volume at a glance
- **2-week calendar** — Mon–Fri layout, schedule and remove workouts per day
- **Workout library** — reusable templates with step-by-step exercise breakdowns
- **Active workout mode** — step progression, sets/reps/rest metrics, exercise form videos, session notes, per-step status marking
- **Garage display** — dual-screen layout designed for a wall-mounted monitor:
  - Screen 1 (`/display/workout`) — full-screen active view with side rail, filmstrip, and PREV/NEXT nav
  - Screen 2 (`/display/plan`) — simplified exercise + video view synced via BroadcastChannel
- **Multi-profile** — cookie-based profile selection, each profile has its own schedule and history
- **YouTube video embeds** — per-exercise form videos, muted autoplay, thumbnail previews
- **Swiss/International Style UI** — strong typographic hierarchy, Geist typeface, raster grid layout

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Prisma 7 + PostgreSQL (Railway)
- `@prisma/adapter-pg` (WebAssembly engine)
- Tailwind CSS 4
- Raster CSS grid system (rsms.me/raster)

## Environment Variables

Create `.env.local`:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?sslmode=require"
```

Notes:
- For Railway proxy hosts (`*.proxy.rlwy.net`), TLS handling is done in `lib/prisma.ts`.
- On Vercel, set `DATABASE_URL` to the **public** Railway URL (`*.proxy.rlwy.net`), not the internal host.

## Local Development

```bash
npm install
npm run db:push   # apply Prisma schema to your database
npm run dev       # start dev server at http://localhost:3000
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production bundle |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to DB |
| `npm run db:push:force` | Force push (accepts data loss) |
| `npm run db:migrate` | Run Prisma migrate deploy |

## Deployment

1. Connect repo to Vercel
2. Set `DATABASE_URL` in Vercel project settings
3. Deploy

If the DB is new, seed it once:

```bash
npx prisma db push --url 'postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?sslmode=require'
```

## Garage Display Setup

Open two browser windows on the wall monitor:

| URL | Purpose |
|---|---|
| `/display/workout` | Primary display — active exercise, filmstrip, nav controls |
| `/display/plan` | Secondary display — exercise name + form video |

Start a workout from the phone (`/`) or the plan screen. Both displays sync via BroadcastChannel (`workouts-garage-v1`).

## Troubleshooting

**`DATABASE_URL is missing` on localhost**
Copy `.env.example` → `.env.local`, paste your Postgres URL, restart `npm run dev`. Or pull from Vercel: `vercel env pull .env.local`.

**`500 /api/profiles` + `DATABASE_URL is missing` on Vercel**
Add `DATABASE_URL` in Vercel env vars and redeploy.

**`P1000 Authentication failed`**
Re-copy connection string or rotate the DB password.

**`self-signed certificate in certificate chain`**
Use the Railway `*.proxy.rlwy.net` URL — TLS config in `lib/prisma.ts` handles it.

**UI stuck on Loading**
Check `/api/profiles` response in browser devtools network tab.

**`500 /api/profiles` + `Server has closed the connection`**
`DATABASE_URL` is wrong, the database is stopped, or Vercel is using a private/internal host. Copy a fresh public URL from Railway, update Vercel env vars, redeploy.
