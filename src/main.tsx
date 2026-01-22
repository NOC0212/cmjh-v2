import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

// 註冊 PWA Service Worker
registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(<App />);
