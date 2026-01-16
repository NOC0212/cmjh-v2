# 🏫 崇明國中現代化組件重構專案 (CMJH-v2)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

這是一個以 [崇明國中官網](https://www.cmjh.tn.edu.tw/) 為基礎，使用 React 18、TypeScript 及現代化 Web 技術重新開發的 v2 2.0 專案。本專案將官網資訊進行高度整合、簡化與自定義，並加入多項專為教學與行政設計的數位工具。

---

## 🎨 核心功能詳解

### 1. 智慧主題與視覺系統
支援深層次的個人化視覺配置，所有設定均會持久化保存於瀏覽器中：
- **雙重選擇器**：支援「外觀模式」（隨系統、淺色、深色）與「主題色彩」獨立配置。
- **預設主題庫**：
  - 基礎色系：藍、綠、橘、紅、紫色。
  - 特色主題：**漸層主題 (Gradient)**、**霓虹主題 (Neon)**。
- **流暢體驗**：全站整合 `Framer Motion`，提供細膩的區塊載入動畫與元件過渡效果。

### 2. 倒數計時系統 (Countdown Widgets)
不僅是計時器，更是學習進度追蹤器：
- **自訂多組配置**：支援同時追蹤段考、結業式、國中教育會考等重要日程。
- **動態進度條**：
  - **邏輯**：根據「起始日期」與「目標日期」計算即時百分比。
  - **視覺**：進度條末端具備柔和白色光暈，並有輕微脈動效果。
- **管理功能**：支援新增、編輯標題/日期、調整顯示順序（上移/下移）、刪除及重置為預設。
- **自動化標籤**：可獨立設定進度條下方的顯示文字（如：本學期進度、寒假倒數進度）。

### 3. 多功能教學小工具 (Tool Suite)
專為課堂互動設計的輕量化工具，支援代碼分割 (Lazy Loading) 提升載入速度：
- **隨機抽籤輪盤 (Wheel)** 🎯
  - **技術**：使用 SVG 動態生成輪盤色塊，內建 8 種循環配色。
  - **邏輯**：流暢的 3 秒緩動曲線旋轉，預設 1-30 號名單，支援即時修改每行一個選項。
- **分組工具 (Grouping)** 👥
  - **模式**：可選擇「按組數分組」或「按每組人數分組」。
  - **演算法**：採用 Fisher-Yates 洗牌演算法，確保 100% 隨機性。
- **順序工具 (Order)** 🔀
  - 快速生成隨機名單順序，具備清晰的序號標記。
  - 支援一鍵複製結果到剪貼簿。
- **專業計時器 & 碼錶 (Timer)** ⏱️
  - **倒數模式**：提供 1/3/5/10/30 分鐘快捷鍵，時間結束具備視覺與音效提醒。
  - **碼錶模式**：精確至 0.01 秒，支援 Tab 快速切換。
- **全螢幕時鐘 (Clock)** 🕐
  - 提供電子數位與多時區參考（台北、東京、紐約），支援沉浸式全螢幕顯示。

### 4. 自動化行政與資訊區塊
- **中央氣象署 (CWA) 天氣預報**：
  - 支援 22 縣市選擇與 **自動定位**。
  - 顯示 36 小時預報（分為三個時段），包含降雨機率與溫度變化。
- **行政公告爬蟲**：
  - **核心邏輯**：透過 `scraper.py` 自動爬取校網公告，生成 `announcements.json`。
  - **自動化**：由 GitHub Actions 每 5 分鐘觸發一次，確保資訊同步。
  - **介面**：支援分頁顯示、關鍵字搜尋，並整合「收藏功能」。
- **動態行事曆**：
  - 資料儲存於 `calendar.json`，每月持續維護更新。
  - 響應式格狀設計，點擊特定日期可展開查看詳細活動清單。

---

## 版本管理與資料安全
- **全域版本號 (App Versioning)**：
  - 程式碼會自動追蹤系統版本
  - 當偵測到核心資料結構變更時，會執行 `ensureVersion()` 進行平滑遷移。
- **資料管理中心**：
  - **備份**：支援將所有個人設定（含自訂計時器、標籤、收藏）匯出為 `.json` 檔案。
  - **還原**：一鍵匯入備份檔，完整恢復使用習慣。
- **智能更新提示 (Update Prompt)**：
  - 遠端版本更新時，系統會彈出美觀的通知視窗，提示使用者重新整理以獲取新功能。

---

## 🛠️ 技術棧與架構

| 類別 | 使用技術 |
|------|----------|
| **框架** | React 18, TypeScript 5, Vite |
| **樣式** | Tailwind CSS, Framer Motion, Lucide Icons |
| **組件庫** | Radix UI, Shadcn/UI |
| **狀態/資料** | TanStack Query (React Query), LocalStorage |
| **路由** | React Router 6 |
| **自動化** | Python (Scrapy), GitHub Actions |

### 📂 專案目錄說明
- `src/components/`：模組化頁面元件（天氣、計時、公告等）。
- `src/pages/tools/`：教學工具頁面專屬目錄。
- `src/lib/app-version.ts`：最高優先級的版本控制邏輯。
- `src/hooks/`：封裝共用邏輯（如 `useComponentSettings` 管理元件排序）。
- `public/data/`：靜態數據中心，存放爬蟲產出的 JSON 檔案。

---

## 🚀 開發人員指南

1. **環境配置**：
   - 複製 `.env.example` 並重新命名為 `.env`。
   - 填入 `VITE_CWA_API_KEY` 以啟用天氣功能。
2. **運行指令**：
   - `npm run dev`: 啟動開發伺服器。
   - `npm run build`: 生產環境構建。
   - `npm run lint`: 執行代碼檢查。

---

## 📄 授權與宣告
本專案為開源專案，旨在提升校園資訊化。更多變更細節請參閱 [UPDATE_LOG.md](file:///d:/python311/cmjh/UPDATE_LOG.md)。

- **最新版本**：v1.3.0
- **更新日期**：2026-01-17
- **開發者**：[nocfond](https://github.com/NOC0212)
