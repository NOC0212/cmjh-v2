# 崇明國中現代化組件重構專案

這是一個以 https://www.cmjh.tn.edu.tw/ 重新使用 TypeScript 及相關語言重新排版、簡化、自定義、整合而成的 v2 網頁。  
本專案以開源，請自行取用或提交分支。

## ✨ 主要功能

### 🎨 主題系統
支援多種主題切換，提供個性化視覺體驗：
- 淺色模式
- 深色模式
- 藍色主題
- 綠色主題
- 橙色主題
- 紅色主題
- 紫色主題
- 漸層主題

### 📅 倒數計時器
- **自訂倒數計時功能**
  - 支援新增多個自訂倒數計時
  - 可設定標題、目標日期、起始日期
  - 自訂進度條標籤文字
  - 編輯和刪除現有倒數計時
  - 調整倒數計時顯示順序（上移/下移）
  - 重置為預設倒數計時
  - 所有設定持久化保存
- **視覺改進**
  - 靜態藍色→紫色漸變背景
  - 進度條末端柔和白色光暈效果
  - 輕微脈動動畫，突出當前進度

### 🌤️ 天氣預報
使用中央氣象署（CWA）API，支援 22 個縣市選擇和自動定位功能。
- 顯示當前天氣和未來 3 個時段的預報
- 日期、示意圖、溫度、降雨機率
- 響應式卡片設計

### 🔗 常用網站
可自訂的常用網站快速連結
- 可在 `/src/components/CommonSites.tsx` 進行更改
- 格式：`{ name: "範例(顯示名稱)", url: "127.0.0.1(網址)" }`

### 📢 行政公告
- 使用 GitHub Actions 自動爬取學校公告
- 每 5 分鐘更新一次
- 支援翻頁和收藏功能
- 原始碼：`scraper.py`
- 資料位置：`/public/data/announcements.json`

### 📆 行事曆
- 響應式設計，點擊日期查看詳細內容
- 每週手動更新及維護
- 資料位置：`/public/data/calendar.json`

### 🛠️ 小工具系統

#### 隨機抽籤輪盤 🎯
- 支援自訂選項，每行一個
- 完整色塊填滿的 SVG 輪盤（8 種顏色循環）
- 流暢的旋轉動畫（3 秒，緩動曲線）
- 預設填入 1-30，開啟即可使用

#### 分組工具 👥
- 兩種分組模式：按組數 / 按每組人數
- Fisher-Yates 洗牌演算法保證隨機性
- 分組結果以卡片形式展示
- 預設填入 1-30

#### 順序工具 🔀
- 隨機排列名單順序
- Fisher-Yates 洗牌演算法
- 序號標記，清晰呈現
- 支援一鍵複製結果到剪貼簿

#### 時鐘 🕐
- 實時顯示當前時間、日期、星期
- 支援全螢幕顯示/退出
- 顯示多時區參考（台北、東京、紐約）
- 每秒自動更新

#### 計時器 / 碼表 ⏱️
- **倒數計時模式**
  - 自訂分鐘和秒鐘
  - 視覺進度圓環顯示剩餘時間
  - 時間到播放提示音
  - 快速設定按鈕（1/3/5/10/15/30 分鐘）
- **碼表模式**
  - 正數計時，從 0 開始
  - 精確到 0.01 秒
  - Tab 切換兩種模式

## 🔧 技術棧

- **框架**: React + TypeScript
- **路由**: React Router
- **樣式**: Tailwind CSS
- **UI 組件**: Radix UI
- **狀態管理**: React Hooks
- **構建工具**: Vite
- **部署**: Vercel

## 📂 專案結構

```
src/
├── components/          # 主要組件
│   ├── ui/             # UI 基礎組件
│   ├── CountdownTimer.tsx
│   ├── WeatherWidget.tsx
│   ├── Announcements.tsx
│   ├── CalendarView.tsx
│   ├── CommonSites.tsx
│   ├── ToolsSection.tsx
│   ├── ToolLayout.tsx
│   └── ...
├── pages/              # 頁面組件
│   ├── Index.tsx
│   └── tools/         # 工具頁面
│       ├── Wheel.tsx
│       ├── Grouping.tsx
│       ├── Order.tsx
│       ├── Clock.tsx
│       └── Timer.tsx
├── hooks/              # 自訂 Hooks
└── lib/                # 工具函數
```

## 🚀 開發指南

### 前置需求

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0 或 **yarn** >= 1.22.0
- **Git**: 用於版本控制

### 快速開始

1. **克隆專案**
```bash
git clone https://github.com/NOC0212/cmjh-v2.git
cd cmjh-v2
```

2. **安裝依賴**
```bash
npm install
```

3. **設置環境變數**
```bash
# 複製環境變數範例文件
cp .env.example .env

# 編輯 .env 文件，填入你的 API 金鑰
```

4. **啟動開發伺服器**
```bash
npm run dev
```

5. **打開瀏覽器**
訪問 `http://localhost:8080`

### 環境變數設置

#### 本地開發環境

1. **創建 `.env` 文件**
在項目根目錄創建 `.env` 文件（可參考 `.env.example`）

2. **設置環境變數**
```env
# 中央氣象署 API 金鑰
# 請到 https://opendata.cwa.gov.tw/ 申請 API 金鑰
VITE_CWA_API_KEY=your-api-key-here
```

**注意**：
- `.env` 文件已加入 `.gitignore`，不會被提交到版本控制
- 如果沒有設置 `VITE_CWA_API_KEY`，將使用預設的開發用 API 金鑰
- 在生產環境部署時，請在部署平台（如 Vercel）設置環境變數

#### Vercel 部署設置

在 Vercel 中設置環境變數的步驟：

1. **進入 Vercel 專案設置**
   - 登入 [Vercel Dashboard](https://vercel.com/dashboard)
   - 選擇你的專案
   - 點擊 **Settings** → **Environment Variables**

2. **添加環境變數**
   - 變數名稱：`VITE_CWA_API_KEY`
   - 變數值：你的中央氣象署 API 金鑰
   - 環境：選擇 **Production**、**Preview**、**Development**（建議全部選擇）

3. **重新部署**
   - 設置環境變數後，Vercel 會自動觸發新的部署
   - 或者手動點擊 **Redeploy** 按鈕

**重要提示**：
- ✅ Vite 環境變數必須以 `VITE_` 開頭才能在客戶端訪問
- ✅ 設置環境變數後，需要重新部署才能生效
- ✅ 環境變數會在構建時注入到代碼中，不會暴露在客戶端代碼中

### 開發命令

| 命令 | 說明 |
|------|------|
| `npm run dev` | 啟動開發伺服器（http://localhost:8080） |
| `npm run build` | 構建生產版本到 `dist/` 目錄 |
| `npm run build:dev` | 構建開發版本（包含 source maps） |
| `npm run preview` | 預覽構建結果 |
| `npm run lint` | 運行 ESLint 檢查代碼 |

### 開發流程

1. **創建功能分支**
```bash
git checkout -b feature/your-feature-name
```

2. **開發和測試**
- 在開發模式下進行開發
- 使用瀏覽器開發工具調試
- 確保代碼通過 lint 檢查

3. **提交代碼**
```bash
git add .
git commit -m "feat: 添加新功能"
git push origin feature/your-feature-name
```

4. **創建 Pull Request**
- 在 GitHub 上創建 PR
- 等待代碼審查
- 合併到主分支

### 專案結構說明

```
cmjh-v2/
├── public/              # 靜態資源
│   ├── data/           # JSON 數據文件
│   │   ├── announcements.json  # 行政公告
│   │   └── calendar.json      # 行事曆
│   └── ...
├── src/
│   ├── components/     # React 組件
│   │   ├── ui/        # shadcn/ui 基礎組件
│   │   ├── ErrorBoundary.tsx  # 錯誤邊界
│   │   ├── Loading.tsx        # 加載組件
│   │   └── ...
│   ├── hooks/         # 自訂 Hooks
│   ├── lib/           # 工具函數
│   ├── pages/         # 頁面組件
│   │   ├── Index.tsx  # 首頁
│   │   └── tools/     # 工具頁面（代碼分割）
│   ├── App.tsx        # 應用入口
│   └── main.tsx       # 應用啟動
├── .env.example       # 環境變數範例
├── vite.config.ts     # Vite 配置
├── tsconfig.json      # TypeScript 配置
└── package.json       # 專案依賴
```

### 代碼規範

- **TypeScript**: 使用嚴格模式，避免使用 `any`
- **ESLint**: 遵循專案 ESLint 規則
- **組件命名**: 使用 PascalCase（如 `CountdownTimer.tsx`）
- **文件命名**: 組件文件使用 PascalCase，工具文件使用 camelCase
- **導入順序**: 
  1. React 相關
  2. 第三方庫
  3. 內部組件
  4. 工具函數
  5. 類型定義

### 性能優化

專案已實作以下性能優化：

- ✅ **代碼分割**: 工具頁面使用 lazy loading
- ✅ **錯誤邊界**: 防止應用崩潰
- ✅ **useMemo/useCallback**: 減少不必要的重新渲染
- ✅ **代碼分割配置**: 將大型依賴庫分離到獨立 chunk

### 調試技巧

1. **React DevTools**
   - 安裝瀏覽器擴展
   - 檢查組件狀態和 props
   - 使用 Profiler 分析性能

2. **瀏覽器控制台**
   - 查看錯誤信息
   - 檢查網絡請求
   - 使用斷點調試

3. **Vite DevTools**
   - 使用 Vite 的 HMR（熱模塊替換）
   - 檢查構建輸出

## 🎯 路由配置

- `/` - 首頁
- `/tools/wheel` - 隨機抽籤輪盤
- `/tools/grouping` - 分組工具
- `/tools/order` - 順序工具
- `/tools/clock` - 時鐘
- `/tools/timer` - 計時器 / 碼表

## 🌈 自訂指南

### 修改倒數計時器
可在組件設定對話框中：
- 新增自訂倒數計時
- 編輯現有倒數計時
- 調整顯示順序
- 刪除不需要的倒數計時

### 修改常用網站
編輯 `/src/components/CommonSites.tsx`：
```typescript
{ name: "網站名稱", url: "https://example.com" }
```

### 修改行事曆
編輯 `/public/data/calendar.json`：
```json
{
  "2024-01": [
    {
      "date": "2024-01-15",
      "title": "活動名稱"
    }
  ]
}
```

## 🔄 最新更新（2025-12-28）V1.2.1

### 🏆 榮譽榜功能
- ✅ **新增榮譽榜模組**：顯示學校榮譽事項
- ✅ **自動爬取資料**：GitHub Actions 每30分鐘自動更新
- ✅ **分頁與收藏**：支援分頁瀏覽和收藏功能
- ✅ **彈性顯示**：可在設定中啟用/停用（預設停用）

### 🔍 搜尋功能優化
- ✅ **全面搜尋**：無論組件是否啟用，所有資料都可被搜尋
- ✅ **榮譽榜搜尋**：搜尋結果包含榮譽榜項目

### ⚙️ 系統改進
- ✅ **設定遷移機制**：自動合併新組件到現有設定
- ✅ **快速導覽**：新增榮譽榜導覽項目

---

## 🔧 故障排除

### 常見問題

#### 1. 環境變數未生效

**問題**: 設置了環境變數但應用無法讀取

**解決方案**:
- 確認環境變數以 `VITE_` 開頭
- 重新啟動開發伺服器（`npm run dev`）
- 檢查 `.env` 文件是否在項目根目錄
- 確認 `.env` 文件格式正確（無引號，無空格）

#### 2. 構建失敗

**問題**: `npm run build` 失敗

**解決方案**:
```bash
# 清除緩存和 node_modules
rm -rf node_modules dist
npm install
npm run build
```

#### 3. 類型錯誤

**問題**: TypeScript 類型檢查失敗

**解決方案**:
- 檢查 `tsconfig.json` 配置
- 確認所有類型定義正確
- 使用 `// @ts-ignore` 僅作為最後手段

#### 4. 天氣 API 無法使用

**問題**: 天氣資訊無法載入

**解決方案**:
- 檢查 API 金鑰是否正確設置
- 確認網絡連接正常
- 檢查瀏覽器控制台的錯誤信息
- 確認 API 金鑰未過期

#### 5. localStorage 錯誤

**問題**: 保存設定時出現錯誤

**解決方案**:
- 檢查瀏覽器是否支援 localStorage
- 確認未使用私密模式（某些瀏覽器限制）
- 檢查存儲空間是否充足
- 清除瀏覽器緩存和 localStorage

#### 6. 路由無法訪問

**問題**: 訪問路由時顯示 404

**解決方案**:
- 確認 `vercel.json` 配置正確
- 檢查路由路徑是否正確
- 確認構建輸出包含所有路由

#### 7. 組件錯誤導致白屏

**問題**: 應用出現白屏

**解決方案**:
- 檢查瀏覽器控制台的錯誤信息
- 確認 Error Boundary 正常工作
- 使用 React DevTools 檢查組件狀態
- 查看錯誤邊界顯示的錯誤詳情

#### 8. 開發伺服器無法啟動

**問題**: `npm run dev` 失敗

**解決方案**:
```bash
# 檢查 Node.js 版本
node --version  # 應該 >= 18.0.0

# 清除緩存
npm cache clean --force

# 重新安裝依賴
rm -rf node_modules package-lock.json
npm install
```

#### 9. 樣式未正確載入

**問題**: Tailwind CSS 樣式未生效

**解決方案**:
- 確認 `tailwind.config.ts` 配置正確
- 檢查 `index.css` 是否正確導入
- 確認構建過程包含 Tailwind 處理
- 清除瀏覽器緩存

#### 10. 代碼分割後頁面無法載入

**問題**: 使用 lazy loading 後頁面無法載入

**解決方案**:
- 確認所有 lazy 導入的路徑正確
- 檢查 Suspense fallback 是否正確設置
- 查看網絡請求是否成功
- 確認構建輸出包含所有 chunk

### 獲取幫助

如果遇到其他問題：

1. **查看 Issues**: 在 GitHub Issues 中搜索類似問題
2. **創建 Issue**: 提供詳細的錯誤信息和重現步驟
3. **檢查文檔**: 查看相關文檔和代碼註釋
4. **聯繫維護者**: 通過 GitHub 聯繫專案維護者

### 調試模式

啟用詳細日誌：

```bash
# 開發模式（已包含詳細日誌）
npm run dev

# 構建開發版本（包含 source maps）
npm run build:dev
```

## 📄 授權

本專案以開源形式發布，歡迎自由取用或提交分支。

## 🤝 貢獻

歡迎提交 Issue 或 Pull Request！

### 貢獻指南

1. **Fork 專案**
2. **創建功能分支** (`git checkout -b feature/AmazingFeature`)
3. **提交更改** (`git commit -m 'Add some AmazingFeature'`)
4. **推送到分支** (`git push origin feature/AmazingFeature`)
5. **開啟 Pull Request**

### 貢獻類型

- 🐛 Bug 修復
- ✨ 新功能
- 📝 文檔改進
- 🎨 UI/UX 改進
- ⚡ 性能優化
- 🔧 代碼重構

**專案持續更新中！**
