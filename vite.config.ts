import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    server: {
      host: "::",
      port: 8081,
    },
    preview: {
      port: 8081,
    },
    plugins: [
      react(),
      VitePWA({
        registerType: "prompt",
        devOptions: {
          enabled: false,
        },
        includeAssets: ["favicon.png", "robots.txt"],
        manifest: {
          name: "崇明國中v2",
          short_name: "崇明國中v2",
          description: "崇明國中v2校園資訊整合平台 — 公告、行事曆、午餐、教學工具",
          theme_color: "#0E7490",
          background_color: "#F8FAFB",
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
            // 食農教育資料庫菜色圖片 — 快取優先
            {
              urlPattern: /^https?:\/\/fatraceschool\.k12ea\.gov\.tw\/.*$/,
              handler: "CacheFirst",
              options: {
                cacheName: "lunch-images",
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 14, // 14 days
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
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            // Radix UI 元件庫
            "ui-vendor": [
              "@radix-ui/react-alert-dialog",
              "@radix-ui/react-collapsible",
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
              "@radix-ui/react-popover",
              "@radix-ui/react-progress",
              "@radix-ui/react-select",
              "@radix-ui/react-switch",
              "@radix-ui/react-tabs",
              "@radix-ui/react-tooltip",
            ],
            // 動畫庫
            "motion-vendor": ["framer-motion"],
            // 圖示庫
            "icon-vendor": ["lucide-react"],
            // Markdown 渲染
            "markdown-vendor": ["react-markdown", "remark-gfm", "remark-breaks"],
            // 工具庫
            "utils-vendor": ["date-fns", "clsx", "tailwind-merge"],
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },
  };
});
