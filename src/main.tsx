import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

// 註冊 PWA Service Worker
// 若發現新版本，在 React 渲染前重新整理，確保使用者看到最新內容
const updateSW = registerSW({
  onNeedRefresh() {
    updateSW(true);
  },
});

// 略延遲渲染，讓 SW 更新檢查有時間完成
// 若發現新版本，會在渲染前重新整理頁面
requestAnimationFrame(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
