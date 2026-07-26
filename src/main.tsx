import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

// 註冊 PWA Service Worker
const updateSW = registerSW({
  onNeedRefresh() {
    const overlay = document.createElement("div");
    overlay.id = "sw-update-overlay";
    overlay.style.cssText = [
      "position:fixed;inset:0;z-index:99999",
      "display:flex;flex-direction:column;align-items:center;justify-content:center",
      "background:hsl(var(--background))",
      "color:hsl(var(--foreground))",
    ].join(";");
    overlay.innerHTML = [
      '<div style="width:40px;height:40px;border:3px solid hsl(var(--border));border-top-color:hsl(var(--primary));border-radius:50%;animation:sw-spin 0.8s linear infinite"></div>',
      '<p style="margin-top:16px;font-size:14px;color:hsl(var(--muted-foreground))">更新中，請稍候...</p>',
      "<style>@keyframes sw-spin{to{transform:rotate(360deg)}}</style>",
    ].join("");
    document.body.appendChild(overlay);
    updateSW(true);
  },
});

// 渲染 React 應用
createRoot(document.getElementById("root")!).render(<App />);
