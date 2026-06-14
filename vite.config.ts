import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    server: {
      host: "::",
      port: 8080,
    },
  preview: {
    port: 8080,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "robots.txt", "placeholder.svg"],
      manifest: {
        name: "崇明國中 v2",
        short_name: "崇明國中 v2",
        description: "專為崇明國中設計的數位工具平台",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        icons: [
          {
            src: "favicon.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "favicon.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "favicon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json}"],
        runtimeCaching: [
          // 學校資料 JSON（行事曆、公告、午餐、榮譽榜） — 快取後背景更新
          {
            urlPattern: /^https?:\/\/[^/]+\/data\/.*\.json$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "cmjh-data-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
            },
          },
          // 學校網站頁面 — 網路優先，離線用快取
          {
            urlPattern: /^https?:\/\/www\.cmjh\.tn\.edu\.tw\/.*$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "cmjh-site-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24,
              },
            },
          },
          // Google Fonts 樣式表 — 快取優先
          {
            urlPattern: /^https?:\/\/fonts\.googleapis\.com\/.*$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-css",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          // Google Fonts 字型檔 — 快取優先
          {
            urlPattern: /^https?:\/\/fonts\.gstatic\.com\/.*$/,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-files",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 60, // 60 days
              },
            },
          },
          // Google Favicon 服務 — 快取優先
          {
            urlPattern: /^https?:\/\/www\.google\.com\/s2\/favicons\/.*$/,
            handler: "CacheFirst",
            options: {
              cacheName: "google-favicons",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React 核心庫
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI 組件庫
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
          ],
          // 工具庫
          'utils-vendor': ['date-fns', 'clsx', 'tailwind-merge'],
        },
      },
    },
    // 提高 chunk 大小警告閾值到 600KB（因為已經做了代碼分割）
    chunkSizeWarningLimit: 600,
  },
};
});
