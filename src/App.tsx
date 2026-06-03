import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import { FirstTimeSetup, checkFirstTimeSetup } from "@/components/FirstTimeSetup";
import { UpdatePrompt } from "@/components/UpdatePrompt";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Loading } from "@/components/Loading";
import { ensureVersion, isMaintenanceWhitelisted } from "@/lib/app-version";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// 代碼分割：工具頁面使用 lazy loading
const Wheel = lazy(() => import("./pages/tools/Wheel"));
const Grouping = lazy(() => import("./pages/tools/Grouping"));
const Order = lazy(() => import("./pages/tools/Order"));
const Clock = lazy(() => import("./pages/tools/Clock"));
const Timer = lazy(() => import("./pages/tools/Timer"));
const QRCode = lazy(() => import("./pages/tools/QRCode"));
const Whiteboard = lazy(() => import("./pages/tools/Whiteboard"));
const Attendance = lazy(() => import("./pages/tools/Attendance"));


const queryClient = new QueryClient();

export interface MaintenanceConfig {
  isMaintenance: boolean;
  showTimer: boolean;
  maintenanceEndTime: string;
  title: string;
  message: string;
}

import { SettingsProvider } from "./hooks/SettingsContext";

const App = () => {
  const [setupCompleted, setSetupCompleted] = useState(() => checkFirstTimeSetup());

  useEffect(() => {
    ensureVersion();
  }, []);

  // 首次設定流程：不需要 QueryClient / 維護設定
  if (!setupCompleted) {
    return (
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route
                path="/home"
                element={
                  <FirstTimeSetup
                    onComplete={() => {
                      setSetupCompleted(true);
                      window.location.href = "/";
                    }}
                  />
                }
              />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SettingsProvider>
            <AppContent />
          </SettingsProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

/**
 * 內部元件：在 QueryClientProvider + SettingsProvider 內部執行，
 * 因此可以使用 useSiteConfig 等依賴 React Query 的 Hook。
 */
function AppContent() {
  const { maintenance: maintenanceConfig, isLoading: loadingMaintenance } = useSiteConfig();
  const [showLoadingUi, setShowLoadingUi] = useState(false);

  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setShowLoadingUi(true);
    }, 200);

    if (!loadingMaintenance) {
      clearTimeout(loadingTimer);
      setShowLoadingUi(false);
    }

    return () => clearTimeout(loadingTimer);
  }, [loadingMaintenance]);

  // 維護設定載入中，顯示 loading 畫面
  if (loadingMaintenance && !maintenanceConfig) {
    return showLoadingUi ? <Loading fullScreen message="正在讀取設定..." /> : null;
  }

  // 檢查維護白名單：若使用者已設定白名單，則跳過維護模式封鎖
  const bypassMaintenance = maintenanceConfig?.isMaintenance && isMaintenanceWhitelisted();
  const effectiveMaintenance = !bypassMaintenance && maintenanceConfig?.isMaintenance;

  return (
    <>
      <UpdatePrompt isHidden={maintenanceConfig?.isMaintenance} />
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ErrorBoundary>
          <Routes>
            {effectiveMaintenance ? (
              <Route
                path="*"
                element={
                  <ErrorBoundary>
                    <Index maintenanceConfig={maintenanceConfig} />
                  </ErrorBoundary>
                }
              />
            ) : (
              <>
                <Route
                  path="/"
                  element={
                    <ErrorBoundary>
                      <Index maintenanceConfig={maintenanceConfig} />
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/home"
                  element={
                    <ErrorBoundary>
                      <FirstTimeSetup onComplete={() => (window.location.href = "/")} />
                    </ErrorBoundary>
                  }
                />

                {/* 工具頁面路由 - 使用代碼分割和錯誤邊界 */}
                <Route
                  path="/tools/wheel"
                  element={
                    <ErrorBoundary>
                      <Suspense fallback={<Loading fullScreen message="載入輪盤工具..." />}>
                        <Wheel />
                      </Suspense>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/tools/grouping"
                  element={
                    <ErrorBoundary>
                      <Suspense fallback={<Loading fullScreen message="載入分組工具..." />}>
                        <Grouping />
                      </Suspense>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/tools/order"
                  element={
                    <ErrorBoundary>
                      <Suspense fallback={<Loading fullScreen message="載入順序工具..." />}>
                        <Order />
                      </Suspense>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/tools/clock"
                  element={
                    <ErrorBoundary>
                      <Suspense fallback={<Loading fullScreen message="載入時鐘..." />}>
                        <Clock />
                      </Suspense>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/tools/timer"
                  element={
                    <ErrorBoundary>
                      <Suspense fallback={<Loading fullScreen message="載入計時器..." />}>
                        <Timer />
                      </Suspense>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/tools/qrcode"
                  element={
                    <ErrorBoundary>
                      <Suspense fallback={<Loading fullScreen message="載入 QR Code 工具..." />}>
                        <QRCode />
                      </Suspense>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/tools/whiteboard"
                  element={
                    <ErrorBoundary>
                      <Suspense fallback={<Loading fullScreen message="載入電子白板..." />}>
                        <Whiteboard />
                      </Suspense>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/tools/attendance"
                  element={
                    <ErrorBoundary>
                      <Suspense fallback={<Loading fullScreen message="載入課堂點名..." />}>
                        <Attendance />
                      </Suspense>
                    </ErrorBoundary>
                  }
                />

                <Route path="*" element={<NotFound />} />
              </>
            )}
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </>
  );
}

export default App;
