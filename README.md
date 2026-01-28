# 🏫 崇明國中現代化組件重構專案 (CMJH-v2)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

這是一個以 [崇明國中官網](https://www.cmjh.tn.edu.tw/) 為基礎，使用 React 18、TypeScript 及現代化 Web 技術重新開發的 2.0 專案。本專案將官網資訊進行高度整合、簡化與自定義，並加入多項專為教學與行政設計的數位工具與美化組件。

---

## 🎨 核心功能詳解

### 1. 智慧主題與現代化 UI 系統
支援深層次的個人化視覺配置，所有設定均會持久化保存於瀏覽器中：
- **雙重選擇器**：支援「外觀模式」（隨系統、淺色、深色）與「主題色彩」獨立配置。
- **現代化組件**：全站組件（按鈕、卡片、對話框）均採用**毛玻璃 (Glassmorphism)**、**大圓角 (rounded-3xl)** 及**自適應漸層**設計，提供極致視覺體驗。
- **特色主題庫**：
  - 基礎色系：藍、綠、橘、紅、紫色。
  - 特色主題：**漸層主題 (Gradient)**、**霓虹主題 (Neon)**、**現代高對比 (Modern)**。
- **流暢體驗**：全站整合 `Framer Motion`，提供細膩的區塊載入動畫與元件過渡效果。

### 2. 進化版倒數計時系統 (Countdown Widgets)
不僅是計時器，更是學習進度追蹤器：
- **自訂多組配置**：支援同時追蹤段考、結業式、國中教育會考等重要日程。
- **動態進度條**：
  - **邏輯**：根據「起始日期」與「目標日期」計算即時百分比。
  - **視覺**：具備**動態移動漸層**與末端柔和光暈效果。
- **管理功能**：支援新增、編輯、調整順序（拖拽感）、刪除及重置。

### 3. 多功能工具套件 (Digital Tools)
專為互動教學設計，支援 Lazy Loading 提升效率：
- **Markdown 快速便籤 (Scratchpad)** 📝
  - 支援 GFM 語法預覽，自動儲存於本地，提供快速複製與清空功能。
- **隨機抽籤輪盤 (Wheel)** 🎯
  - SVG 動態生成，即時修改名單，具備流暢旋轉動畫。
- **智慧分組與順序工具 (Grouping/Order)** 👥
  - 採用 Fisher-Yates 隨機演算法，支援靈活的分組模式與結果複製。
- **電子時鐘與專業計時器 (Clock/Timer)** ⏱️
  - 全螢幕沉浸式顯示，具備多時區參考與精確碼錶。

### 4. 資訊整合與自動化
- **中央氣象署 (CWA) 臺南天氣**：
  - 精確至臺南各行政區，提供 3 天詳細預報與即時舒適度分析。
- **營養午餐 (Lunch Menu)** 🍱
  - 顯示當日與當週精選菜單，支援自動展開當日菜色。
- **行政公告與榮譽榜**：
  - **智慧爬蟲**：GitHub Actions 自動執行 Python 腳本更新資料。
  - **功能**：支援搜尋、分頁顯示與個人「收藏」系統。
- **動態校曆**：
  - 整合自訂日程功能，支援響應式格狀佈局與詳細事件展開。

---

## 🛠️ 技術棧與架構

| 類別 | 使用技術 |
|------|----------|
| **框架** | React 18, TypeScript 5, Vite |
| **樣式** | Tailwind CSS (Mix modern glass logic), Framer Motion |
| **組件庫** | Radix UI, Shadcn/UI (Highly Customized) |
| **狀態/資料** | TanStack Query (React Query), LocalStorage |
| **路由** | React Router 6 (Future Flags Enabled) |
| **自動化** | Python (Scrapy), GitHub Actions |

---

## 🚀 開發人員指南

1. **環境配置**：
   - 複製 `.env.example` 並重新命名為 `.env`，填入 `VITE_CWA_API_KEY`。
2. **運行指令**：
   - `npm run dev`: 啟動開發伺服器。
   - `npm run build`: 生產環境構建。

---

## 📄 授權與宣告
本專案為開源專案，旨在提升校園資訊化。

- **最新版本**：v1.3.5 /0128
- **更新日期**：2026-01-28
- **開發者**：[nocfond](https://github.com/NOC0212)
