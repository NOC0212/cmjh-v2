import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

// 註冊 PWA Service Worker — 背景靜默自動更新
// 新 SW 就緒時不顯示 overlay，直接背景啟動，使用者無感
registerSW({
  onNeedRefresh(updateSW) {
    // 背景靜默更新：直接啟動新 SW，不通知使用者
    // 新 SW 啟動後下次頁面載入即套用最新程式碼
    setTimeout(() => updateSW(true), 500);
  },
});

// 渲染 React 應用
createRoot(document.getElementById("root")!).render(<App />);
