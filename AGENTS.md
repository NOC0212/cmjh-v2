# AGENTS.md

## Project Overview

崇明國中 (CMJH) school info platform — React 18 SPA with PWA support. UI text is Traditional Chinese (zh-TW).

## Commands

```bash
npm install        # install deps (both package-lock.json and bun.lockb are committed; npm is canonical)
npm run dev        # dev server, port 8080 (host "::")
npm run build      # production build
npm run build:dev  # development-mode build
npm run lint       # eslint
npm run preview    # preview production build on port 8080
```

No test runner is configured. Root `tsconfig.json` is a solution-style file (`"files": []`) — a bare `npx tsc --noEmit` fails with "No inputs were found". Validate per-project instead:

```bash
npx tsc --noEmit -p tsconfig.app.json    # app code (src/)
npx tsc --noEmit -p tsconfig.node.json   # vite.config.ts
```

> ⚠️ **Do NOT run `build`, `build:dev`, or `preview` commands** — these are slow, resource-intensive, and unnecessary for code review. Only run `lint` or `tsc` for validation.

## Architecture

- **Entry**: `src/main.tsx` → `src/App.tsx` (React Router; tool pages lazy-loaded in `App.tsx`). `index.html` is the SPA shell (Google Fonts, favicon, meta).
- **First-run flow**: if localStorage `cmjh-first-setup-completed` is unset, all routes redirect to `/home` (setup wizard in `src/pages/Home.tsx`), which completes → hard redirect to `/app`. Don't break `/home`.
- **Pages**: `src/pages/Index.tsx` (main dashboard), `src/pages/tools/*.tsx` (8 lazy-loaded tools), `src/pages/Docs.tsx`, `NotFound.tsx`.
- **Components**: `src/components/` (app components), `src/components/ui/` (shadcn/ui — do not hand-edit these)
- **Hooks**: `src/hooks/` — `SettingsContext` (localStorage settings + theme), `useJsonData` (server JSON fetching), `useSiteConfig`/`useAutoUpdate` (Supabase-backed), plus custom-data hooks (`useCalendarEvents`, `useCommonSites`, `useSiteCountdowns`, `useCrudManager`)
- **Lib**: `src/lib/` — `utils.ts`, `supabase.ts`, `crypto.ts`, `page-background.ts`, `app-version.ts`
- **Path alias**: `@/` → `./src/` (tsconfig + vite.config.ts)
- **Static data**: `public/data/*.json` (lunch, announcements, honors, calendar — scraper-generated, see below)

## Data Flow (important, non-obvious)

- All `public/data/*.json` is fetched through `useJsonData` (`src/hooks/useJsonData.ts`), which forces a query-key prefix `["jsonData", ...]` and uses TanStack Query (5-min stale, refetch on window focus).
- `useAutoUpdate` polls Supabase `site_config.app_version` every 5 min. On version change it runs `migrateData()` and invalidates **all** `["jsonData"]` queries — this is how fresh scraper JSON reaches users. Any new JSON data hook must use the `"jsonData"` prefix or it won't be invalidated.
- `src/lib/app-version.ts` owns all localStorage keys (settings, common sites, calendar events, countdowns, favorites, read announcements, maintenance whitelist) and version migration. Add new storage keys to `STORAGE_KEYS` so migrate/export/import cover them.
- Admin access is a hidden unlock: click the version label ~5 times in Settings → `cmjh-admin-unlocked=true`.

## Python Scrapers

Three root-level Python 3 scripts feed `public/data/` via GitHub Actions:

| Script | Output | Schedule (cron) |
|--------|--------|-----------------|
| `lunch.py` | `public/data/lunch.json` | `0 22 * * *` UTC (= 06:00 CST; the "08:00" in the workflow comment is wrong) |
| `scraper.py` | `public/data/announcements.json` | `*/30 * * * *` |
| `honors_scraper.py` | `public/data/honors.json` | `*/30 * * * *` (same job as scraper.py) |

Dependencies: `requests`, `beautifulsoup4` (see `requirements.txt`). Workflows commit the JSON back to the repo; data updates land in git history, not a server.

## Key Conventions

- **shadcn/ui**: Components in `src/components/ui/` are generated — use `npx shadcn-ui@latest add <component>` to add new ones, don't hand-write
- **State management**: TanStack Query for server/remote data, LocalStorage for user settings (via `SettingsContext`)
- **Styling**: Tailwind CSS with CSS variables; dark mode + theme colors + page backgrounds applied as classes on `<body>`/`#root` by `SettingsContext.applyTheme`
- **ESLint**: `@typescript-eslint/no-unused-vars` is `off` (unused vars are allowed)
- **tsconfig**: `strict` is `false`, but `strictNullChecks`, `noImplicitAny`, `noUnusedLocals`, `noUnusedParameters` are all `true`
- **PWA**: vite-plugin-pwa, `registerType: "prompt"` with silent background auto-update (see `src/main.tsx`). Workbox runtime caches (see `vite.config.ts`): school `data/*.json` → StaleWhileRevalidate 1d; `www.cmjh.tn.edu.tw` pages → NetworkFirst 1d; Google Fonts & favicons → CacheFirst

## Environment

Copy `.env.example` to `.env`:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | No* | Supabase project URL (visit counter, admin) |
| `VITE_SUPABASE_ANON_KEY` | No* | Supabase anon/public key |
| `VITE_CWA_API_KEY` | No | Central Weather Administration API key (browser-side, weather widget). Get from https://opendata.cwa.gov.tw |

\* App **runs fine without these** — `SUPABASE_ENABLED` in `src/lib/supabase.ts` gates the visit counter and admin features off (they log a warning). Good for local dev without setup.

### Supabase Setup

1. Create a free project at https://supabase.com
2. Run `supabase-setup-complete.sql` (project root) in **SQL Editor** — one file sets up everything (tables, RLS, SECURITY DEFINER functions)
3. Copy project URL + anon key from **Settings > API** into `.env`

The visit counter increments once per page load via a secure PostgreSQL function (`SECURITY DEFINER`); RLS lets the anon role only read and call the increment function. Admin passwords are bcrypt-hashed (pgcrypto) at rest and SHA-256 hashed in the browser for transport — raw passwords never leave the client. Admin config lives in the `site_config` table (id=1): maintenance mode, app version, password hash. There is **no `api/` folder** — weather is fetched client-side with `VITE_CWA_API_KEY` (CWA WAF blocks Vercel's IP range, so a server proxy was removed).

## Deploy

Vercel with SPA rewrite rule (all non-file routes → `index.html`, see `vercel.json`). Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_CWA_API_KEY` (optional) in Vercel Dashboard > Environment Variables.
