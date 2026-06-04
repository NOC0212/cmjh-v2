<h1 align="center">崇明國中 CMJH V2</h1>

<h3 align="center">現代化校園資訊整合平台 — React 18 SPA with PWA Support</h3>

<p align="center">
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://vite.dev/"><img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white" alt="Vite"></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?logo=tailwindcss&logoColor=white" alt="Tailwind CSS"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps"><img src="https://img.shields.io/badge/PWA-enabled-blueviolet.svg" alt="PWA"></a>
  <a href="https://vercel.com"><img src="https://img.shields.io/badge/Deployed_on-Vercel-000000?logo=vercel&logoColor=white" alt="Vercel"></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white" alt="Supabase"></a>
  <a href=".github/workflows/"><img src="https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=githubactions&logoColor=white" alt="GitHub Actions"></a>
</p>

## 快速開始

```bash
git clone https://github.com/NOC0212/cmjh-v2.git
cd cmjh-v2
npm install
npm run dev        # 啟動開發伺服器 → http://localhost:8080
```

天氣功能需設定 `CWA_API_KEY`（至 [中央氣象署 OpenData](https://opendata.cwa.gov.tw) 申請）。
開發階段 Vite 會自動代理 `/api/weather` 請求至 CWA，金鑰保留在伺服器端不暴露給前端。
正式部署時需在 **Vercel Dashboard > Settings > Environment Variables** 加入 `CWA_API_KEY`（詳見[建置與部署](#建置與部署)）。

## Supabase 快速部署

> 未設定 Supabase 時，網站仍可正常運作，僅訪問計數與管理後台功能停用。

部分功能（訪問計數、管理後台、維護模式、版本管理）需要 Supabase 資料庫，如需啟用請依以下步驟設定：

### 一鍵設定

1. 建立免費 Supabase 專案 → https://supabase.com
2. 進入 **SQL Editor**，貼上執行 [`supabase-setup-complete.sql`](./supabase-setup-complete.sql)（一個檔案搞定全部）
3. 複製 **Settings > API** 中的 Project URL 和 anon key
4. 複製 `.env.example` 為 `.env`，填入憑證：

```ini
VITE_SUPABASE_URL=https://你的專案.supabase.co
VITE_SUPABASE_ANON_KEY=你的匿名金鑰
CWA_API_KEY=你的氣象署金鑰（選填）
```

## 目錄

- [架構總覽](#架構總覽)
- [核心功能](#核心功能)
- [小工具套件](#小工具套件)
- [導航系統](#導航系統)
- [設定系統](#設定系統)
- [維護與更新](#維護與更新)
- [技術棧](#技術棧)
- [自動化資料流](#自動化資料流)
- [開發者指南](#開發者指南)
- [建置與部署](#建置與部署)
- [授權](#授權)

## 架構總覽

```
┌──────────────────────────────────────────────────────────┐
│                    CMJH V2 SPA                           │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐   │
│  │ 首頁頁面  │  │ 搜尋頁面  │  │ 收藏頁面 │  │ 設定頁面 │   │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘   │
│                                                          │
│  ┌───────────────────────────────────────────────────┐   │
│  │              首頁組件 (可排序、可切換)              │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐     │   │
│  │  │倒數器 │ │天氣  │ │常用  │ │工具  │ │榮譽榜 │     │   │
│  │  │      │ │      │ │網站  │ │區塊  │ │       │     │   │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘     │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐                       │   │
│  │  │公告  │ │行事曆 │ │午餐  │                       │   │
│  │  └──────┘ └──────┘ └──────┘                       │   │
│  └───────────────────────────────────────────────────┘   │
│                                                          │
│  ┌───────────────────────────────────────────────────┐   │
│  │               8 種教學工具頁面                     │   │
│  │  輪盤 · 分組 · 順序 · 時鐘 · 計時器 · QR Code       │   │
│  │  電子白板 · 課堂點名                               │   │
│  └───────────────────────────────────────────────────┘   │
│                                                          │
│  ┌───────────────────────────────────────────────────┐   │
│  │              啟動流程 (首次訪問)                   │   │
│  │  首次設定精靈 → 版本檢查 → 最新公告彈窗 → 首頁       │   │
│  └───────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────┐  ┌──────────────────┐  ┌──────────────┐    │
│  │ React    │  │ TanStack Query   │  │ LocalStorage │    │
│  │ Router   │  │ (資料快取)        │  │ (個人設定)   │    │
│  └──────────┘  └──────────────────┘  └──────────────┘    │
└──────────────────────────────────────────────────────────┘
```

### 資料流向

資料來源分為三個管道：

**① Supabase 資料庫**（管理後台、倒數計時、站內公告、訪問計數）

```
┌──────────────────────────┐
│       Supabase DB        │
│  site_config             │
│  site_countdowns         │
│  site_announcements      │
│  site_visits             │
└──────┬────────┬──────────┘
       │        │
       ▼        ▼
  TanStack   Supabase RPC
   Query    (寫入: AdminPanel
  (讀取)     CRUD、密碼驗證)
       │        ▲
       │        │
       │  ┌─────┴──────┐
       │  │ AdminPanel │
       │  │ (需密碼驗證) │
       │  └────────────┘
       ▼
  前端元件
```

**② 靜態 JSON**（行政公告、榮譽榜、午餐、行事曆等 — GitHub Actions 自動爬取）

```
GitHub Actions (排程)
    │
    ├── scraper.py      ──→ announcements.json
    ├── honors_scraper.py ──→ honors.json
    └── lunch.py         ──→ lunch.json
                                  │
                                  ▼
                         public/data/*.json
                                  │
                                  ▼
                    TanStack Query / 直接 fetch
                    (快取+重試, 30分自動更新)
                                  │
                                  ▼
                             前端元件
```

**③ 天氣 API**（中央氣象署即時資料）

```
前端元件 ──→ /api/weather (Vercel Edge Function) ──→ CWA OpenData API
                  │
         process.env.CWA_API_KEY
         (金鑰保留在伺服器端)
```

## 核心功能

首頁 8 個組件皆可透過設定頁面啟用/停用、拖曳排序。

| 功能 | 說明 | 預設 |
|------|------|------|
| **倒數計時器** | 多組日程倒數 + 動態進度條，支援 CRUD、拖曳排序、伺服器同步 | ✅ |
| **天氣動態** | 臺南 36 行政區即時天氣 + 3 天可折疊預報 | ✅ |
| **常用網站** | 快速連結管理系統，支援 CRUD、Favicon、排序 | ✅ |
| **教學工具** | 8 種互動式課堂工具 (獨立路由頁面) | ✅ |
| **行政公告** | GitHub Actions 自動爬取，支援分類篩選、收藏、附件檢視 | ✅ |
| **校園行事曆** | 校曆整合 + 個人自訂事件 CRUD | ✅ |
| **營養午餐** | 當日菜單含分類色標、圖片放大檢視 | ✅ |
| **榮譽榜** | 競賽獲獎資訊，支援分頁瀏覽與收藏 | ❌ 可設定 |
| **站內公告** | 版本更新資訊推播，含類型標籤、置頂、NEW 標記 | ✅ |

<details>
<summary><strong>功能詳細說明</strong></summary>

### 倒數計時器

追蹤段考、結業式、會考等校園重要日程。

- **多組管理**：左右切換瀏覽多個倒數目標，顯示目前進度 (1/N)
- **動態進度條**：從起始日至目標日的即時完成百分比 (自動計算)
- **完整 CRUD**：新增、編輯、刪除、拖曳排序 (Framer Motion)
- **伺服器同步**：從 Supabase `site_countdowns` 表載入預設值，合併本地自訂項目
- **時區校正**：強制以台灣時間 (UTC+8) 計算
- **目標達成動畫**：時間到時顯示慶祝畫面 🎉

### 天氣動態

串接中央氣象署 CWA OpenData API (F-D0047-079)，精確至臺南各行政區。

- **即時資訊**：溫度、體感溫度、降雨機率、濕度、風速、風向、紫外線指數、舒適度描述
- **3 天預報**：可折疊詳細面板，展開後顯示逐日體感溫度、相對濕度、風速風向、紫外指數
- **36 行政區**：支援全臺南市各區下拉切換
- **天氣圖示**：依據 CWA 天氣代碼 (WeatherCode) 對應不同圖示，含備援關鍵字判斷
- **自動更新**：每 30 分鐘自動重新拉取

### 常用網站

自訂快速連結管理，支援完整 CRUD。

- **CRUD 管理**：透過對話框新增/編輯/刪除連結
- **Favicon**：透過 Google Favicon Service 載入圖示（可於偏好設定關閉）
- **排序**：上下移動調整順序
- **響應式網格**：手機 2 欄、桌面最多 6 欄
- **內建預設**：行事曆 PDF、成績查詢、因材網、布可星球等校園常用連結

### 行政公告

自動同步崇明國中官方網站公告（GitHub Actions 每 30 分鐘執行爬蟲）。

- **分類篩選**：依處室/類別動態標籤列篩選
- **摘要展開**：點擊公告展開內文、附件連結
- **收藏系統**：收藏公告並在「我的收藏」頁面統一檢視
- **分頁載入**：每頁 8 則，附導航按鈕與動畫過渡
- **附件預覽**：附件以卡片形式顯示，支援文件圖示與 hover 效果
- **資料來源**：單一檔案 `announcements.json`（含舊版多檔案相容）

### 校園行事曆

月曆網格顯示校園行事曆事件。

- **事件整合**：校曆事件 + 個人自訂事件（合併顯示，藍點/紫點區分）
- **自訂事件**：透過 `CalendarDialog` 新增/編輯/刪除個人事件
- **月份切換**：下拉選單 + 前後按鈕，附動畫過渡
- **日期 Popover**：點擊日期查看當日事件清單（含「學校」/「自訂」標籤）
- **今日標記**：當天日期顯示「今」徽章
- **響應式**：7 欄 grid + Popover 替代桌面 hover

### 營養午餐

從 `lunch.json` 讀取當日菜單。

- **當日菜單**：顯示今日供應的菜色列表
- **分類色標**：主食 / 主菜 / 副菜 / 蔬菜 / 湯品 / 附餐（各自對應主題色）
- **菜色圖片**：從食農教育資料庫載入縮圖（點擊可放大檢視）
- **更新時間**：顯示資料最後更新時間
- **資料格式**：`{ "last_updated": "...", "items": [{ "category": "主食", "name": "五穀飯", "image": "..." }] }`

### 榮譽榜

競賽獲獎資訊展示頁面。

- **分頁瀏覽**：每頁 10 筆，支援上下頁導航
- **收藏功能**：可收藏榮譽榜項目至「我的收藏」
- **外部連結**：點擊連結至原始公告頁面
- **自動清理**：爬蟲更新時自動移除已失效的收藏項目

### 站內公告 (Site Announcements)

位於導航「公告」頁面，展示網站營運公告。

- **類型標籤**：更新 (update)、重要 (alert)、資訊 (info)、維護 (maintenance)，各有對應圖示與顏色
- **置頂功能**：`pinned: true` 的公告會固定顯示在最上方
- **NEW 標記**：7 天內的新公告自動標記「NEW」閃爍徽章
- **展開閱讀**：有內容的公告可點擊展開詳細內文

</details>

## 小工具套件

8 種互動教學工具，各自獨立路由頁面 (lazy-loaded)，工具間可透過導覽快速切換。

| 工具 | 技術亮點 | 檔案 |
|------|---------|------|
| **隨機抽籤輪盤** | SVG 動態生成轉盤，支援自由編輯名單、旋轉動畫、歷史紀錄 | `Wheel.tsx` |
| **分組工具** | Fisher-Yates 洗牌演算法，支援彈性分組數、名單編輯 | `Grouping.tsx` |
| **順序工具** | 名單隨機排列，一鍵複製結果至剪貼簿 | `Order.tsx` |
| **數位時鐘** | Intl API 精確處理 17 個時區，全螢幕模式，時區卡片快速切換 | `Clock.tsx` |
| **倒數計時/碼表** | 支援快選預設時間 (1m/3m/5m/10m)、自訂時間、暫停/繼續 | `Timer.tsx` |
| **QR Code 產生器** | 即時將文字/網址轉為 QR Code，支援一鍵下載 | `QRCode.tsx` |
| **電子白板** | Canvas 繪圖、顏色/粗細調整、橡皮擦、全螢幕、圖片匯出 | `Whiteboard.tsx` |
| **課堂點名** | 學生名單管理、出席狀況切換 (出勤/曠課/請假)、批次全勤、一鍵複製 | `Attendance.tsx` |

進入任一工具後，ToolLayout 會顯示全部 8 個工具的快速切換按鈕。

## 導航系統

### ResponsiveNav — 響應式三層導航

桌面版和手機版各自採用最適配置：

| 模式 | 桌面版 | 手機版 |
|------|--------|--------|
| **頂部** | 左側伸縮側邊欄 (64px → 240px hover 展開) | 固定頂部 header（校名 + 重新整理 + 漢堡選單） |
| **底部** | — | 半透明浮動底部導航列 (毛玻璃效果) |
| **功能** | 主頁 · 搜尋 · 公告 · 收藏 · 設定 | 同上 |

- 收藏圖示顯示即時數量徽章 (紅色圓點)
- 側邊欄含重新整理按鈕與快速導航選單

### AppSidebar — 快速導航選單

漢堡選單 (DropdownMenu) 包含：

- 快捷跳轉 (倒數計時器、天氣、常用網站、工具、榮譽榜、公告、行事曆)
- 開源 GitHub 專案連結
- 學生登入 (Google Workspace @cmjh.tn.edu.tw)

## 設定系統

位於導航「設定」頁面，5 大分類設定區塊：

### 1. 版面排序 (Layout)

- 拖曳排序已啟用的首頁元件 (Framer Motion Reorder)
- 勾選啟用/停用各元件
- 全部顯示一鍵還原
- 完工後需手動按「儲存排序」

### 2. 主題外觀 (Theme)

```
主題模式：淺色 🌞 · 深色 🌙 · 跟隨系統 💻
主題顏色：藍 · 紅 · 綠 · 橙 · 紫 · 霓虹 · 現代漸層 · 主題漸層
```

### 3. 自訂背景 (Background)

| 選項 | 說明 |
|------|------|
| 預設 | 主題變數漸層 |
| 背景一 | 深藍→紫→金漸層 + 預覽圖片 |
| 背景二 | 深灰→灰→淺灰漸層 + 預覽圖片 |
| 圖片 | 支援圖片網址輸入 或 本機上傳 (Data URL) |

- 套用網址後立即生效
- 支援上傳清除與還原預設

### 4. 偏好設定 (Preferences)

| 選項 | 預設 | 說明 |
|------|------|------|
| 顯示更新提示 | ✅ | 有新版本時顯示更新提示視窗 |
| 啟動顯示公告 | ✅ | 登入首頁後自動展開 7 天內最新快訊 |
| 顯示網站圖示 | ❌ | 常用網站卡片顯示 Google Favicon |

### 5. 系統資料 (System)

| 功能 | 說明 |
|------|------|
| **版本資訊** | 顯示目前版本與最新版本，支援一鍵更新 |
| **匯出資料** | 下載所有個人設定與資料 (JSON) |
| **匯入資料** | 還原已備份的設定檔 (自動重新整理) |
| **重置設定** | 恢復所有設定至預設值 (需二次確認) |

## 維護與更新

### 維護模式 (MaintenanceModal)

透過管理後台設定，資料儲存在 Supabase `site_config` 表中的 `maintenance` JSONB 欄位：

```json
{
  "isMaintenance": true,
  "showTimer": true,
  "maintenanceEndTime": "2026-02-22T12:00:00+08:00",
  "title": "過年期間暫停服務",
  "message": "2/14-2/22 期間網頁不開放"
}
```

- 啟用時首頁顯示 Skeleton 載入骨架 + 全螢幕維護對話框
- 支援倒數計時器（日/時/分/秒即時更新）

### 版本更新系統 (UpdatePrompt)

- 啟動時自動比對本地版本與 `LATEST_VERSION`
- 不一致時顯示精美更新對話框（版本號 + 更新亮點）
- 更新過程中顯示圓形進度動畫 → 自動遷移資料 → 重新整理
- 可於偏好設定中關閉更新提示

### 最新公告彈窗 (LatestAnnouncementModal)

- 啟動時自動從 Supabase `site_announcements` 表載入
- 過濾出 7 天內未讀公告，依序顯示
- 支援「下一則」「略過」「不再顯示」互動
- 已讀狀態記錄在 localStorage

## 技術棧

| 類別 | 技術 |
|------|------|
| **框架** | React 18 + TypeScript 5 |
| **建置** | Vite 5 + SWC |
| **樣式** | Tailwind CSS 3 + CSS Variables |
| **組件庫** | shadcn/ui (50+ 元件) + Radix UI |
| **動畫** | Framer Motion |
| **路由** | React Router 6 (lazy loading, ErrorBoundary) |
| **狀態管理** | TanStack Query + React Context (LocalStorage) |
| **PWA** | vite-plugin-pwa (NetworkFirst, 1 天快取) |
| **資料庫** | Supabase (PostgreSQL + pgcrypto bcrypt) |
| **爬蟲** | Python 3 + requests + BeautifulSoup 4 |
| **排程** | GitHub Actions (cron) |
| **部署** | Vercel (SPA rewrite rules + Edge Function) |

## 自動化資料流

### Python 爬蟲指令稿

三個由 GitHub Actions 排程執行的爬蟲，負責自動更新 `public/data/` 靜態 JSON：

| 指令稿 | 輸出 | 排程 |
|--------|------|------|
| `lunch.py` | `public/data/lunch.json` | 每日 08:00 CST |
| `scraper.py` | `public/data/announcements.json` | 每 30 分鐘 |
| `honors_scraper.py` | `public/data/honors.json` | 每 30 分鐘 |

```bash
# 本地手動執行爬蟲
python scraper.py
python honors_scraper.py
python lunch.py
```

### JSON 資料結構

```text
public/data/
├── lunch.json              # 營養午餐當日菜單
├── announcements.json      # 行政公告清單
├── honors.json             # 榮譽榜資料
├── calendar.json           # 校園行事曆 (由 GitHub Actions 自動更新)
```

#### 資料格式範例 (lunch.json)

```json
{
  "last_updated": "2026-05-08 07:01:38",
  "items": [
    { "category": "主食", "name": "五穀飯", "image": "https://fatraceschool.k12ea.gov.tw/dish/pic/1767151539077921" },
    { "category": "主菜", "name": "打拋豬", "image": "https://fatraceschool.k12ea.gov.tw/dish/pic/1413871940174074" },
    { "category": "副菜", "name": "椒鹽毛豆莢", "image": "..." },
    { "category": "蔬菜", "name": "彩椒青花菜", "image": "..." },
    { "category": "湯品", "name": "關東煮湯", "image": "..." },
    { "category": "附餐", "name": "葡萄", "image": "..." }
  ]
}
```

## 開發者指南

### 常用指令

```bash
npm install             # 安裝相依套件
npm run dev             # 啟動開發伺服器 (port 8080)
npm run build           # 生產環境建置
npm run build:dev       # 開發模式建置
npm run lint            # ESLint 檢查
npm run preview         # 預覽生產建置 (port 8080)
npx tsc --noEmit        # TypeScript 型別檢查
```

### 目錄結構

```text
src/
├── main.tsx             # 入口點
├── App.tsx              # React Router + lazy loading + 維護模式
├── index.css            # Tailwind 全域樣式
├── components/          # 通用 UI 元件
│   ├── ui/              # shadcn/ui 元件 (勿手動編輯)
│   ├── CountdownTimer.tsx   # 倒數計時器
│   ├── WeatherWidget.tsx    # 天氣動態
│   ├── CommonSites.tsx      # 常用網站
│   ├── LunchMenu.tsx        # 營養午餐
│   ├── CalendarView.tsx     # 校園行事曆
│   ├── Announcements.tsx    # 行政公告
│   ├── HonorsBoard.tsx      # 榮譽榜
│   ├── ToolsSection.tsx     # 小工具展示
│   ├── ResponsiveNav.tsx    # 響應式導航
│   ├── AppSidebar.tsx       # 快速導航選單
│   ├── SettingsPage.tsx     # 設定頁面
│   ├── FavoritesPage.tsx    # 我的收藏
│   ├── SearchPage.tsx       # 全文搜尋
│   ├── SiteAnnouncementsPage.tsx  # 站內公告
│   ├── FirstTimeSetup.tsx   # 首次設定精靈
│   ├── LatestAnnouncementModal.tsx # 最新公告彈窗
│   ├── AdminPanel.tsx       # 管理後台
│   ├── VisitCounter.tsx     # 訪問計數器
│   ├── UpdatePrompt.tsx     # 版本更新提示
│   ├── MaintenanceModal.tsx # 維護模式
│   ├── ErrorBoundary.tsx    # 錯誤邊界
│   ├── ToolLayout.tsx       # 工具頁面佈局
│   └── ...
├── hooks/               # 自訂 hook
│   ├── SettingsContext.tsx
│   ├── useCalendarEvents.ts
│   ├── useCommonSites.ts
│   ├── useFavorites.tsx
│   ├── useNotes.ts
│   ├── useScrollAnimation.tsx
│   ├── useComponentSettings.ts
│   ├── use-mobile.tsx
│   ├── useSiteConfig.ts        # 站台設定（維護、版本、管理密碼）
│   ├── useSiteCountdowns.ts    # 預設倒數計時（Supabase）
│   ├── useSiteAnnouncements.ts # 站內公告（Supabase）
│   └── useVisitCounter.ts      # 訪問計數器（Supabase）
├── api/                 # Vercel Edge Functions
│   └── weather.ts       # 天氣 API 代理
├── lib/                 # 工具函式
│   ├── utils.ts
│   ├── app-version.ts
│   ├── page-background.ts
│   ├── crypto.ts        # SHA-256 密碼雜湊
│   └── supabase.ts      # Supabase 客戶端初始化
└── pages/               # 路由頁面
    ├── Index.tsx        # 首頁
    ├── NotFound.tsx     # 404
    └── tools/           # 教學工具頁面 (lazy-loaded)
        ├── Wheel.tsx
        ├── Grouping.tsx
        ├── Order.tsx
        ├── Clock.tsx
        ├── Timer.tsx
        ├── QRCode.tsx
        ├── Whiteboard.tsx
        └── Attendance.tsx
```

### 加入新 shadcn/ui 元件

```bash
npx shadcn-ui@latest add <component>
```

shadcn/ui 元件放置在 `src/components/ui/` 中，請勿手動編輯。

## 建置與部署

### 生產建置

```bash
npm run build
```

輸出至 `dist/` 目錄。

### Vercel 部署

`vercel.json` 已內建 SPA Rewrite 規則，所有非檔案路由指向 `index.html`。

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

#### 環境變數設定

部署後須在 **Vercel Dashboard > Settings > Environment Variables** 加入以下變數：

| 變數 | 必要 | 說明 |
|------|------|------|
| `VITE_SUPABASE_URL` | 選填（部分功能需要） | Supabase Project URL（Settings > API） |
| `VITE_SUPABASE_ANON_KEY` | 選填（部分功能需要） | Supabase 匿名金鑰 |
| `CWA_API_KEY` | 否 | 中央氣象署 API 金鑰（⚠️ **不含 `VITE_` 前綴**，僅伺服器端使用） |

#### API 代理（天氣功能）

`api/weather.ts` 是 Vercel Edge Function，代理中央氣象署天氣 API 請求：

- 前端呼叫 `/api/weather?district=東區`
- 伺服器端讀取 `CWA_API_KEY` 附加 Authorization 參數再轉發至 CWA
- CWA 金鑰**不會暴露到瀏覽器端**
- 開發時 Vite dev server 會自動代理 `/api/weather`（金鑰同樣保留在伺服器端）

## 授權

MIT © [nocfond](https://github.com/NOC0212)

---

<div align="center">

**提升校園資訊化 · 社群驅動 · 完全開源**

[GitHub Repository](https://github.com/NOC0212/cmjh-v2) · [Report Bug](https://github.com/NOC0212/cmjh-v2/issues) · [Request Feature](https://github.com/NOC0212/cmjh-v2/issues)

</div>
