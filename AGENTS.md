# AGENTS.md

## Project Overview

崇明國中（CMJH）校園資訊平台 — 一體式 PWA app，React 18 + TypeScript + Vite 5。

## Commands

```bash
npm install        # install deps
npm run dev        # dev server on port 8081
npm run build      # production build
npm run preview    # preview production build on port 8081
```

無測試框架。靜態檢查用 `npx tsc --noEmit`。

> ⚠️ **盡量不要執行 `build` / `preview`** — 耗時且資源密集。僅執行 `tsc --noEmit` 驗證。

## Architecture

- **Entry**: `src/main.tsx` → `src/app/App.tsx` (React Router, lazy-loaded pages)
- **Layout**: `src/app/AppLayout.tsx` — 桌面側欄（可收合）＋ 手機頂欄＋底列
- **Pages**: `src/pages/` (路由對應頁面); `src/pages/tools/` (工具頁，獨立 ToolLayout)
- **Home widgets**: `src/features/home/` (8 個首頁區塊)
- **Components**: `src/components/` (共用元件); `src/components/ui/` (基礎 UI — 不應手動編輯)
- **Hooks**: `src/hooks/` (SettingsContext, 自訂 hooks, Supabase 資料 hooks)
- **Lib**: `src/lib/` (utils, supabase client, crypto, app-version, data types)
- **Static data**: `public/data/*.json` (爬蟲產生的 JSON)
- **Path alias**: `@/` → `./src/` (tsconfig + vite.config.ts)

## Theme

單一品牌主題色，由 CSS 變數 `--hue` 驅動（`src/styles/theme.css`），預設 `--hue: 191`（深藍×青碧）。
- 使用者可在設定頁用滑桿調整品牌色相（0-360），透過 `useSettings().setThemeHue()` 套用
- light/dark/system 模式切換（class 策略）；無自訂背景
- `.bg-brand-gradient` / `.text-brand-gradient` / `.bg-brand-soft` / `.section-icon` 等輔助 class

## 可用 UI 元件

| 元件 | 路徑 |
|------|------|
| Button | `@/components/ui/button` |
| Card | `@/components/ui/card` |
| Input | `@/components/ui/input` |
| Textarea | `@/components/ui/textarea` |
| Label | `@/components/ui/label` |
| Badge | `@/components/ui/badge` |
| Skeleton | `@/components/ui/skeleton` |
| Separator | `@/components/ui/separator` |
| Dialog | `@/components/ui/dialog` |
| AlertDialog | `@/components/ui/alert-dialog` |
| DropdownMenu | `@/components/ui/dropdown-menu` |
| Select | `@/components/ui/select` |
| Switch | `@/components/ui/switch` |
| Tabs | `@/components/ui/tabs` |
| Progress | `@/components/ui/progress` |
| Popover | `@/components/ui/popover` |
| Tooltip | `@/components/ui/tooltip` |
| Collapsible | `@/components/ui/collapsible` |
| Toast | `@/components/ui/toast` (`useToast()` → `toast({...})`) |

**不存在的元件**（不可 import）：chart, table, radio-group, calendar, sonner, recharts, react-day-picker, react-hook-form, next-themes, cmdk, vaul, use-toast (舊路徑)

## 資料層

### 靜態 JSON（爬蟲）
- `useAnnouncements()` → `{ data: Announcement[], isLoading }`
- `useHonors()` → `{ data: HonorItem[], isLoading }`
- `useLunch()` → `{ data: LunchData, isLoading }`
- `useSchoolCalendar()` → `{ data: CalendarData, isLoading }`
- 全部來自 `@/hooks/use-static-data`

### Supabase 資料
- `useSiteConfig()` → `{ maintenance, appVersion, updateConfig, ... }`
- `useSiteCountdowns()` → `{ countdowns, updateCountdowns, ... }`
- `useSiteAnnouncements()` → `{ announcements, updateAnnouncements, ... }`
- `useVisitCounter()` → `{ total, today, increment }`
- `useVisitStats(days)` → `{ stats, dailyVisits, ... }`
- `useCalendarEvents()` → `{ customEvents, addEvent, ... }`
- `useCommonSites()` → `{ sites, addSite, updateSite, removeSite }`
- 全部來自 `@/hooks/`

### 設定
- `useSettings()` → `{ settings, updateSettings }` 來自 `@/hooks/settings-context`
- `useFavorites()` → `{ favorites, addFavorite, removeFavorite, isFavorite, cleanupFavorites }` 來自 `@/hooks/use-favorites`

## 路由

| 路徑 | 頁面 | 說明 |
|------|------|------|
| `/` | — | 重新導向：未完成首次體驗 → `/home`；已完成 → `/app` |
| `/home` | LandingPage | 登陸頁（全螢幕，不套用 AppLayout） |
| `/app` | HomePage | 首頁（8 個可排序區塊） |
| `/announcements` | AnnouncementsPage | 公告（Tabs: 學校公告 / 站內公告） |
| `/favorites` | FavoritesPage | 依類型分組的收藏 |
| `/search` | SearchPage | 全文搜尋 |
| `/settings` | SettingsPage | 設定（外觀含品牌色相/偏好/系統） |
| `/admin` | AdminPage | 管理後台（需密碼） |
| `/docs` | DocsPage | 使用說明 |
| `/tools/*` | 工具頁 | 8 種工具（獨立 ToolLayout，無 AppLayout 導航） |

## Styling Rules

- **一律使用品牌色**：`primary`, `bg-primary`, `text-primary`, `bg-primary/10`, `bg-brand-gradient` 等
- **禁止** `from-blue-500`, `bg-rose-100`, `text-emerald-700` 等非品牌色 class
- 年級、分類用品牌色柔和底（`bg-primary/10`, `bg-success/10`, `bg-warning/10`）
- Toast API：`const { toast } = useToast()` → `toast({ title, description?, variant?: "default"|"success"|"destructive" })`

## Python Scrapers

位於 `scripts/`，由 GitHub Actions 排程執行：

| 腳本 | 輸出 | 排程 |
|------|------|------|
| `scraper.py` | `public/data/announcements.json` | 每 30 分鐘 |
| `honors_scraper.py` | `public/data/honors.json` | 每 30 分鐘 |
| `lunch.py` | `public/data/lunch.json` | 每日 08:00 CST |

依賴：`requests`, `beautifulsoup4`（見 `scripts/requirements.txt`）

## 環境

複製 `.env.example` 為 `.env` 並填寫 Supabase 憑證（VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY）及氣象 API（VITE_CWA_API_KEY，選填）。

## 部署

Vercel SPA 模式（`vercel.json` 含 rewrite 規則）。在 Vercel Dashboard 設定環境變數。