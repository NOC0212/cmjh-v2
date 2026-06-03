import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 手動載入所有環境變數（包含非 VITE_ 前綴的 CWA_API_KEY）
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        // 代理天氣 API：在開發模式下也將金鑰保留在伺服器端
        "/api/weather": {
          target: "https://opendata.cwa.gov.tw",
          changeOrigin: true,
          rewrite: (path) =>
            path.replace(
              /^\/api\/weather/,
              "/api/v1/rest/datastore/F-D0047-079",
            ),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq, _req) => {
              const apiKey = env.CWA_API_KEY;
              if (apiKey) {
                const delim = proxyReq.path.includes("?") ? "&" : "?";
                proxyReq.path += `${delim}Authorization=${encodeURIComponent(apiKey)}`;
              }
            });
          },
        },
      },
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
        theme_color: "#ffffff",
        background_color: "#ffffff",
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
          {
            urlPattern: /^https:\/\/www\.cmjh\.tn\.edu\.tw\/.*$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "cmjh-api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
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
