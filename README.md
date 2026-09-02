# 崇明國中資訊平台 (CMJH v2)

整合式校園資訊 PWA 應用 — React 18 + TypeScript + Vite 5 + Tailwind CSS

## 特色

- **一體式設計**：單一品牌主題色（深藍×青碧），桌面側欄＋手機底列導航
- **PWA 支援**：可安裝至主畫面，離線快取，自動更新
- **即時資料**：學校公告、榮譽榜、午餐菜單、行事曆 — 透過 GitHub Actions 自動爬蟲更新
- **管理後台**：Supabase 驅動的站台設定、預設倒數、站內公告、訪問統計、維護模式
- **教學工具**：隨機輪盤、分組、點名、順序抽選、QR 碼產生、時鐘、計時器、白板

## 快速開始

```bash
# 安裝依賴
npm install

# 啟動開發伺服器（port 8080）
npm run dev

# 生產建置
npm run build

# 靜態檢查
npx tsc --noEmit
```

## 環境變數

複製 `.env.example` 為 `.env` 並填入：

| 變數 | 必填 | 說明 |
|------|------|------|
| `VITE_SUPABASE_URL` | 是 | Supabase 專案網址 |
| `VITE_SUPABASE_ANON_KEY` | 是 | Supabase 匿名金鑰 |
| `VITE_CWA_API_KEY` | 否 | 中央氣象署 API 金鑰（天氣元件） |

## Supabase 設定

1. 在 [supabase.com](https://supabase.com) 建立免費專案
2. 至 **SQL Editor** 執行 `supabase/schema.sql` — 一次性完成所有設定
3. 從 **Settings > API** 複製專案 URL 與 anon key 到 `.env`

## 資料爬蟲

Python 爬蟲位於 `scripts/`，由 GitHub Actions 排程執行：

| 腳本 | 輸出 | 排程 |
|------|------|------|
| `scraper.py` | `public/data/announcements.json` | 每 30 分鐘 |
| `honors_scraper.py` | `public/data/honors.json` | 每 30 分鐘 |
| `lunch.py` | `public/data/lunch.json` | 每日 08:00 CST |

## 專案結構

```
cmjhv2/
├── public/
│   └── data/              # 爬蟲產生的靜態 JSON 資料
├── scripts/               # Python 爬蟲腳本
├── supabase/
│   └── schema.sql         # Supabase 完整設定 SQL
├── src/
│   ├── app/               # App shell（路由、導航、Providers）
│   ├── components/        # 共用元件（ui/ 為基礎 UI 元件庫）
│   ├── features/home/     # 首頁 8 個區塊元件
│   ├── hooks/             # React hooks（設定、資料、Supabase）
│   ├── lib/               # 工具函式、資料型別、Supabase 客戶端
│   ├── pages/             # 頁面元件（路由頁面）
│   │   └── tools/         # 8 種教學工具頁
│   └── styles/            # 主題 CSS（品牌色、淺深模式）
└── .github/workflows/     # GitHub Actions 爬蟲排程
```

## 技術棧

- **前端**：React 18, TypeScript, Vite 5, Tailwind CSS 3, Framer Motion
- **狀態管理**：TanStack Query (server), localStorage (user settings)
- **PWA**：vite-plugin-pwa (workbox, auto-update)
- **後端**：Supabase (PostgreSQL, Storage, RLS)
- **爬蟲**：Python 3, requests, BeautifulSoup4

## 授權

MIT License — 詳見 [LICENSE](./LICENSE)