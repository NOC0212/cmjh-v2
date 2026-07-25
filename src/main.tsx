import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

// 註冊 PWA Service Worker
// 使用 prompt 模式，新版本靜默等待，下次進入頁面才啟用，避免強制重新載入
registerSW();

// 渲染 React 應用
createRoot(document.getElementById("root")!).render(<App />);
