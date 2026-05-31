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

Copy `.env.example` to `.env` and set `VITE_CWA_API_KEY` (Central Weather Administration API key from https://opendata.cwa.gov.tw). Weather feature works without it but may hit rate limits.

## Deploy

Vercel with SPA rewrite rule (all non-file routes → `index.html`, see `vercel.json`).