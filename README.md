# Workout Calendar

A multi-profile workout planner built with Next.js 16, React 19, Prisma, and PostgreSQL.

## Features

- Today-focused home screen with quick start
- 2-week calendar scheduling
- Workout library and screenshot import flow
- Active workout mode (step progression, notes, status)
- Multi-profile support with cookie-based profile selection
- Local IndexedDB cache plus server-backed persistence

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Prisma + PostgreSQL
- `@prisma/adapter-pg` + `pg`
- Tailwind CSS 4

## Environment Variables

Create `.env.local`:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?sslmode=require"
```

Notes:
- For Railway proxy hosts (`*.proxy.rlwy.net`), TLS handling is done in `lib/prisma.ts`.
- In Vercel, set `DATABASE_URL` to your database provider's **public** connection URL (not a private/internal host). For Railway, use the `*.proxy.rlwy.net` URL from the Connect tab.

## Local Development

Install dependencies:

```bash
npm install
```

Apply Prisma schema to your database:

```bash
npm run db:push
```

Start dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` - run local dev server
- `npm run build` - build production bundle
- `npm run start` - run production server
- `npm run lint` - run ESLint
- `npm run db:generate` - generate Prisma client
- `npm run db:push` - push Prisma schema to DB
- `npm run db:push:force` - force push with data-loss acceptance
- `npm run db:migrate` - run Prisma migrate deploy

## Deployment

Deploy to Vercel:

1. Connect repository to Vercel.
2. Set `DATABASE_URL` in Vercel project settings.
3. Deploy.

If the DB is new, run once against production database:

```bash
npx prisma db push --url 'postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?sslmode=require'
```

## Behavior Notes

- Unauthenticated visitors are redirected to `/profiles` by `proxy.ts`.
- After selecting/creating a profile, a `profileId` cookie is set and the user is sent to `/`.

## Troubleshooting

- `DATABASE_URL is missing` on **localhost**
  - Copy `.env.example` to `.env.local`, paste your Postgres URL, then restart `npm run dev`.
  - Easiest source: Vercel project → Settings → Environment Variables → `DATABASE_URL` (Development), or pull with `vercel env pull .env.local` after `vercel login`.
- `500 /api/profiles` + `DATABASE_URL is missing` on **Vercel**
  - Add `DATABASE_URL` in Vercel env vars and redeploy.
- `P1000 Authentication failed`
  - Re-copy connection string or rotate DB password.
- `self-signed certificate in certificate chain`
  - Use Railway URL + current TLS logic in `lib/prisma.ts` (already configured).
- UI stuck on Loading
  - Open browser devtools network tab and check `/api/profiles` response body.
- `500 /api/profiles` + `Server has closed the connection`
  - Usually means `DATABASE_URL` is wrong, the database is stopped, or Vercel is using a private DB host. Copy a fresh public URL from Railway/Neon, update Vercel env vars, and redeploy.
