# AGENTS.md

## Project Overview

崇明國中 (CMJH) school info platform — React 18 SPA with PWA support.

## Commands

```bash
npm install        # install deps
npm run dev        # dev server on port 8080
npm run build      # production build
npm run build:dev  # development-mode build
npm run lint       # eslint
npm run preview    # preview production build on port 8080
```

No test runner is configured. No `typecheck` script — use `npx tsc --noEmit` if needed.

## Architecture

- **Entry**: `src/main.tsx` → `src/App.tsx` (React Router, lazy-loaded tool pages)
- **Pages**: `src/pages/Index.tsx` (home), `src/pages/tools/*.tsx` (lazy-loaded)
- **Components**: `src/components/` (app components), `src/components/ui/` (shadcn/ui — do not hand-edit these)
- **Hooks**: `src/hooks/` (SettingsContext, custom hooks)
- **Lib**: `src/lib/` (utils, page-background, app-version)
- **Static data**: `public/data/*.json` (lunch, announcements, honors, calendar, site-announcements, maintenance)
- **Path alias**: `@/` maps to `./src/` (configured in both tsconfig and vite.config.ts)

## Python Scrapers

Three root-level Python 3 scripts feed `public/data/` via GitHub Actions:

| Script | Output | Schedule |
|--------|--------|----------|
| `lunch.py` | `public/data/lunch.json` | Daily 08:00 CST |
| `scraper.py` | `public/data/announcements.json` | Every 30 min |
| `honors_scraper.py` | `public/data/honors.json` | Every 30 min |

Dependencies: `requests`, `beautifulsoup4` (see `requirements.txt`).

## Key Conventions

- **shadcn/ui**: Components in `src/components/ui/` are generated — use `npx shadcn-ui@latest add <component>` to add new ones, don't hand-write
- **State management**: TanStack Query for server data, LocalStorage for user settings (via `SettingsContext`)
- **Styling**: Tailwind CSS with CSS variables for theming; dark mode via `class` strategy
- **ESLint**: `@typescript-eslint/no-unused-vars` is `off` (unused vars are allowed)
- **tsconfig**: `strictNullChecks`, `noImplicitAny`, `noUnusedLocals`, `noUnusedParameters` are all `true`
- **PWA**: vite-plugin-pwa with auto-update; service worker caches `cmjh.tn.edu.tw` requests (NetworkFirst, 1 day)

## Environment

Copy `.env.example` to `.env` and fill in the required environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes (visit counter, admin) | Supabase project URL (Settings > API) |
| `VITE_SUPABASE_ANON_KEY` | Yes (visit counter, admin) | Supabase anon/public key (Settings > API) |
| `CWA_API_KEY` | No | Central Weather Administration API key (server-side only, no `VITE_` prefix). Set in Vercel Dashboard or local `.env` for dev proxy. |

### Supabase Setup

1. Create a free project at https://supabase.com
2. Go to **SQL Editor** and run `supabase-setup-complete.sql` (in the project root)
3. Copy your project URL and anon key from **Settings > API** into `.env`
4. If upgrading from an older version, run `supabase-migration-bcrypt.sql` instead to add bcrypt support

The visit counter increments once per page load via a secure PostgreSQL function (`SECURITY DEFINER`). Row Level Security ensures the anon role can only read and call the increment function — no direct writes.

Admin passwords are hashed with bcrypt (via `pgcrypto` extension) on the database side for storage, and SHA-256 on the client side for transport — raw passwords never leave the browser.

## API Routes

- `api/weather.ts` — Vercel Edge Function that proxies Central Weather Administration API requests. Requires `CWA_API_KEY` environment variable on the server.

## Deploy

Vercel with SPA rewrite rule (all non-file routes → `index.html`, see `vercel.json`).

Set the following environment variables in Vercel Dashboard > Settings > Environment Variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `CWA_API_KEY` (optional, for weather widget — no `VITE_` prefix)