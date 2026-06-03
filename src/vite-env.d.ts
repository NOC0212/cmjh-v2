/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  // 天氣 API 金鑰已移為伺服器端環境變數，透過 api/weather.ts 代理
  // 本地開發時請在 .env 設定 CWA_API_KEY（不含 VITE_ 前綴）
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
