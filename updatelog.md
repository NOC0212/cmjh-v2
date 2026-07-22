# 更新日誌

### ✨ 新增功能
- **首頁全新設計**：全新的入口頁面（`src/pages/Home.tsx`），包含歡迎畫面、Bento Grid 功能亮點、動畫計數器與開源區塊，取代原本的 `FirstTimeSetup` 元件。
- **說明文件頁面**：新增 `/docs` 路由（`src/pages/Docs.tsx`），具備 Intersection Observer 目錄導航與錨點捲動功能。
- **Markdown 渲染**：新增 `react-markdown`、`remark-gfm`、`remark-breaks` 依賴，用於公告內容的 Markdown 格式顯示。
- **Atkinson Hyperlegible 字型**：在 `index.html` 中引入，提升閱讀障礙友善性。
- **PWA Service Worker 更新**：`src/main.tsx` — Service Worker 改為 `onNeedRefresh` 模式，並以 `requestAnimationFrame` 延後渲染，等待更新檢查完成後才呈現頁面。

### 🐛 Bug 修復
- **隨機輪盤（Wheel）**：修復 CSS 變數 `--primary` 為空字串時輪盤顏色全數 NaN 的錯誤（之前 `"".split(' ')` 會回傳 `[""]`，導致 `parseInt("", 10)` 回傳 `NaN`，fallback 永遠不會觸發）。
- **電子白板（Whiteboard）**：補上 `img.onerror` 處理，並以 `pendingUndoRef` + `useCallback` 防止快速點擊復原時的多個 `img.onload` 競爭條件造成畫面錯亂。
- **計時器（Timer）**：移除 useEffect 中不必要的 `timeLeft <= 0` 檢查，消除 ESLint 的 missing dependency 警告。
- **課堂點名（Attendance）**：將 `window.confirm` 原生對話框替換為統一的 `AlertDialog` 元件；導航路徑從 `/` 改為 `/app`。
- **行事曆重複請求**：`CalendarAddDialog` 與 `CalendarDialog` 新增 `availableMonths` prop，由 `CalendarView` 將已載入的月份資料傳入，消除 2 次重複的 `fetch('/data/calendar.json')` 請求。
- **404 頁面**：返回連結從 `/` 改為 `/app`。

### ⚡ 效能優化
- **主 Chunk 大幅縮減**：主 chunk（`index.js`）從 1,255 kB 降至約 **470 kB（↓62.5%）**，不再觸發 chunk size 警告。
- **程式碼分割**：`AdminPanel`、`SettingsPage`、`SiteAnnouncementsPage`、`FavoritesPage`、`SearchPage`、`LatestAnnouncementModal` 改為 `React.lazy()` 動態載入，減少初始 bundle 大小。
- **Vendor 分離**：`vite.config.ts` 新增 `motion-vendor`（framer-motion）、`icon-vendor`（lucide-react）、`markdown-vendor`（react-markdown + remark 插件）等 manualChunks，與主 chunk 平行載入。
- **useTransition**：頁面切換使用 `startTransition` 包裹，保留舊畫面直至 lazy chunk 載入完成，避免 Suspense fallback 閃爍。

### 🎨 UI/UX 強化
- **CSS 設計系統升級**：`src/index.css` — `--radius` 從 `1rem` 改為 `0.875rem`；新增 `--shadow-xs` 至 `--shadow-xl` 五階陰影系統；暗色模式色板全面調整為藍灰基調（`225 25% 6%` / `225 20% 10%`）。
- **設定頁面重構**：`SettingsPage.tsx` — 全新選單式設定介面，包含版面排序（拖曳重排）、主題模式切換、主題色選擇、自訂背景（網址/上傳）、偏好設定與資料匯入匯出；主題色 `COLORS` 陣列改用 CSS 漸層色票。
- **天氣元件優化**：`WeatherWidget.tsx` — 移除 `CardTitle` 匯入，新增 `RefreshCw` 重新整理按鈕，`DISTRICTS` 陣列改為多項並排格式。
- **倒數計時器重構**：`CountdownTimer.tsx` — 移除未使用的 `isImagePageBackground` 匯入與 `direction` 狀態，`Date` 建構子加上 `as string` 型別斷言，移除複雜的條件式背景樣式邏輯。
- **常用網站**：`CommonSites.tsx` — 標題改為 `text-xl` 標準色搭配 `Globe` 圖示，加入站點數量徽章，佈局更加緊湊（`gap-1.5`）。
- **公告元件**：`Announcements.tsx` — 加入 `AnimatePresence`/`motion` 交錯動畫，加入 `if (!res.ok) throw new Error(...)` 錯誤處理，移除 `mb-12 scroll-mt-20` 類別。
- **最新公告彈窗**：`LatestAnnouncementModal.tsx` — 公告內容改為 `ReactMarkdown` 渲染（含 `remarkGfm`、`remark-breaks` 插件），移除未使用的 `setShowLatestAnnouncementOnStartup`。
- **榮譽榜**：`HonorsBoard.tsx` — 加入 `AnimatePresence`/`motion` 切換動畫、新增 `direction` 狀態控制左右滑入方向、加入 `fetch` 錯誤檢查（`!res.ok`）。
- **工具區塊**：`ToolsSection.tsx` — `tools` 陣列結構改版：`description` 改為 `subtitle`，移除 `color`/`bgColor`，新增 `gradient`/`border`/`iconBg`/`iconColor`/`span` 等細粒度樣式欄位，移除 `Card` 匯入。

### 📝 檔案變更

#### 新增檔案
- `src/pages/Home.tsx`
    - 全新首頁入口元件，取代 `FirstTimeSetup`。
- `src/pages/Docs.tsx`
    - 說明文件頁面，附 Intersection Observer 目錄導航。
- `src/components/NavPill.tsx`
    - 頂部導覽藥丸元件，支援捲動透明切換。

#### 刪除檔案
- `src/components/FirstTimeSetup.tsx`
    - 以全新的 `Home` 頁面取代，功能整合至 `/home` 路由。

#### 其他
- `.gitignore`
    - 新增 `.opencode/` 規則，將 AI 輔助工具技能目錄排除在版本控制之外。

#### 修改檔案

**核心架構**
- `src/App.tsx`
    - `FirstTimeSetup` → `Home`，新增 `/docs` 路由，根路由改為 `/` → `/app` 重新導向。
- `src/main.tsx`
    - Service Worker 改為 `onNeedRefresh` + `requestAnimationFrame` 延遲渲染。
- `index.html`
    - 新增 Atkinson Hyperlegible 字型載入。
- `vite.config.ts`
    - 新增 `motion-vendor` / `icon-vendor` / `markdown-vendor` manualChunks，`registerType` 改為 `prompt`，更新 PWA manifest 設定。
- `tsconfig.app.json`
    - 移除已棄用的 `ignoreDeprecations: "6.0"` 設定。
- `package.json`
    - 新增 `react-markdown` / `remark-gfm` / `remark-breaks` 依賴。

**樣式系統**
- `src/index.css`
    - 更新 `--radius` 為 `0.875rem`，新增 `--color-saturation` 與 `--shadow-*` 五階陰影系統。暗色模式色板全面調整為藍灰基調，更新側邊欄與漸層變數。

**首頁與路由**
- `src/pages/Index.tsx`
    - 6 個子頁面改為 `React.lazy()` 動態載入，加入 `useTransition` 與 `handlePageChange` 平滑切換，引入 `Loading` 元件作為 Suspense fallback，新增 `componentAnimationClass` 交錯淡入動畫，版面使用 `space-y-10 md:space-y-14`。
- `src/pages/NotFound.tsx`
    - 404 頁面返回連結從 `/` 改為 `/app`。

**元件**
- `src/components/ResponsiveNav.tsx`
    - 建立 `NavItem` 介面統一型別，加入 `cn` 匯入，新增 `handleNavClick` 函數與 `isFooter` 參數，按鈕改用原生 `button` 元件與更新 class 結構。
- `src/components/SettingsPage.tsx`
    - 全新設定頁面，使用 `Switch` 取代 `Checkbox`，新增 `Separator` 與 `fastTransition`。主題色 `COLORS` 改用漸層色票，選單卡片採用 `motion.button` 布局。
- `src/components/CountdownTimer.tsx`
    - 移除 `isImagePageBackground` 與 `direction` 狀態，`Date` 建構子型別強化，移除條件式背景樣式。
- `src/components/AdminPanel.tsx`
    - 加入 `Separator` 匯入，移除 `ResponsiveContainer` / `DailyVisit`，各 hook 移除 `isConfigured` 解構，移除大量內聯註解。
- `src/components/WeatherWidget.tsx`
    - 移除 `CardTitle`，新增 `RefreshCw` 圖示，加入 `cn` 匯入，`DISTRICTS` 改為多項並排格式。
- `src/components/Announcements.tsx`
    - 加入 `AnimatePresence`/`motion` 動畫，加入 `!res.ok` 錯誤拋出，移除 `pageMeta` 與 `mb-12`/`scroll-mt-20`。
- `src/components/LatestAnnouncementModal.tsx`
    - 公告內容改為 `ReactMarkdown` 渲染，移除 `setShowLatestAnnouncementOnStartup`。
- `src/components/CommonSites.tsx`
    - 加入 `Globe` 圖示與站點數徽章，標題改為 `text-xl`，按鈕更緊湊（`h-8 px-2 rounded-lg text-xs`），grid 改為 `gap-1.5`。
- `src/components/HonorsBoard.tsx`
    - 加入 `AnimatePresence`/`motion` 切換動畫與 `direction` 狀態，加入 `Trophy` 圖示與 `cn`，加入 `!res.ok` 錯誤檢查。
- `src/components/SiteAnnouncementsPage.tsx`
    - 移除 `useRef`/`useEffect`，加入 `ReactMarkdown` / `remarkGfm` / `remarkBreaks`，移除 `AnnouncementImage` 元件與 `AnimatePresence`。
- `src/components/LunchMenu.tsx`
    - `Sparkles` → `ChefHat` 圖示，`motion.article` → `motion.div`，圖片容器縮小（`h-16 w-16` → `h-14 w-14`）。
- `src/components/ErrorBoundary.tsx`
    - `handleGoHome` 路徑從 `/` 改為 `/app`。
- `src/components/Loading.tsx`
    - 容器從 `72px` 放大至 `96px`，favicon 從 `36x36` 放大至 `72x72`，SVG `viewBox` 更新為 `96 96`。
- `src/components/UpdatePrompt.tsx`
    - 移除 `FALLBACK_VERSION` 匯入。
- `src/components/ToolLayout.tsx`
    - `tools` 陣列移除 `color` 欄位，返回路徑從 `/` 改為 `/app`，header 背景改為 `bg-background/80 backdrop-blur-xl`。
- `src/components/ToolsSection.tsx`
    - `tools` 陣列欄位改版（`description`→`subtitle`，新增 `gradient`/`border`/`iconBg`/`span` 等），移除 `Card` 匯入。
- `src/components/ui/calendar.tsx`
    - `IconLeft`/`IconRight` 移除未使用的 `_props` 參數。
- `src/components/CalendarView.tsx`
    - 加入 `CalendarDays` 圖示與 `cn`，fetch 加入 `!res.ok` 錯誤拋出，傳遞 `months` 給子元件。
- `src/components/CalendarDialog.tsx`
    - 接受 `availableMonths` prop，若 props 有值則跳過內部 fetch。
- `src/components/CalendarAddDialog.tsx`
    - 接受 `availableMonths` prop，若 props 有值則跳過內部 fetch。

**工具頁面**
- `src/pages/tools/Wheel.tsx`
    - 修復 CSS 變數解析 fallback，加入 `cn` 匯入取代本地定義，移除註解與標題描述區塊。
- `src/pages/tools/Whiteboard.tsx`
    - 加入 `useCallback`、`pendingUndoRef`、`img.onerror` 處理，移除 framer-motion/AnimatePresence 匯入。
- `src/pages/tools/Timer.tsx`
    - 移除第一個 useEffect 中的 `timeLeft <= 0` 檢查。
- `src/pages/tools/Attendance.tsx`
    - 新增 `showClearDialog` 狀態，`window.confirm` → `AlertDialog`，`modeConfig` 加入 `activeColor`/`inactiveColor` 屬性，導航路徑 `/` → `/app`。
- `src/pages/tools/Clock.tsx`
    - useState → `useReducer` + `tick` 函數計時，`MapPin` 取代 `Minimize2`，時間顯示加入 `tracking-wider`，日期格式改為全形括號並加入空格。
- `src/pages/tools/QRCode.tsx`
    - 採用 `ToolLayout`，佈局改為 `lg:col-span-2`，輸入框改為 `text-sm h-10` 並加入說明文字，顏色選擇器改為 `w-11 h-10`，移除獨立標題區塊。
- `src/pages/tools/Grouping.tsx`
    - 採用 `ToolLayout` 佈局與卡片式設計。
- `src/pages/tools/Order.tsx`
    - 採用 `ToolLayout` 佈局與卡片式設計。

**Hooks**
- `src/hooks/useSiteConfig.ts`
    - 移除 `useCallback` 匯入。
