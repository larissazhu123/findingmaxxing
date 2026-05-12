# FindMaxxing

A UMass lost-and-found web app. Next.js (Pages Router) + Supabase + Prisma + Leaflet.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Setup

This project needs two env files at the repo root. See [`ENVIRONMENT_SETUP.md`](./ENVIRONMENT_SETUP.md) for full instructions.

1. `.env` — Prisma `DATABASE_URL` for Postgres (Supabase pooler).
2. `.env.local` — Public Supabase keys consumed by the browser.

```ini
# .env
DATABASE_URL=postgresql://postgres:<db-password>@db.<PROJECT_ID>.supabase.co:5432/postgres
```

```ini
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://<PROJECT_ID>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxx
SUPABASE_SECRET_KEY=sb_secret_xxxxxxxx
```

Get the values from your Supabase project → **Settings → API Keys** (publishable + secret) and **Settings → Database** (connection string). Legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` JWT names are also accepted as fallbacks. Contact the database manager if you don't have a Supabase login.

Restart the dev server after editing env files.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start Next.js in dev mode |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run db:generate` | `prisma generate` |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:push` | `prisma db push` (sync schema without a migration) |
| `npm run db:studio` | Open Prisma Studio |

`postinstall` automatically runs `prisma generate`, so the client is always in sync after `npm install`.

## Project Layout

```
src/
├── components/        UI + feature components (Navbar, MapView, ListingCard, …)
│   └── ui/            shadcn-style primitives
├── context/           React context providers (UserContext)
├── lib/               Shared client/server helpers (auth, prisma, supabaseClient)
├── pages/             Next.js Pages Router
│   ├── api/           API routes
│   │   ├── auth/      Auth sync
│   │   ├── claims/    Claim management (scaffolded)
│   │   ├── listings/  Listings CRUD (scaffolded)
│   │   ├── notifications/  Notification feed (scaffolded)
│   │   └── user/      User profile / points / nickname
│   └── …              index, login, callback, dashboard, settings
└── styles/            Tailwind globals
```

## Security

- Never commit `.env` or `.env.local`. Both are gitignored.
- Service-role keys must stay server-side only — never expose them via `NEXT_PUBLIC_*`.

## Deploy

Vercel-ready. Set the same env vars in the Vercel project dashboard, then push to the connected branch.
