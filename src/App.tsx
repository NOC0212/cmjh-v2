import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import { FirstTimeSetup, checkFirstTimeSetup } from "@/components/FirstTimeSetup";
import { UpdatePrompt } from "@/components/UpdatePrompt";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Loading } from "@/components/Loading";
import { ensureVersion } from "@/lib/app-version";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// 代碼分割：工具頁面使用 lazy loading
const Wheel = lazy(() => import("./pages/tools/Wheel"));
const Grouping = lazy(() => import("./pages/tools/Grouping"));
const Order = lazy(() => import("./pages/tools/Order"));
const Clock = lazy(() => import("./pages/tools/Clock"));
const Timer = lazy(() => import("./pages/tools/Timer"));

import MaintenancePage from "./pages/Maintenance";

const queryClient = new QueryClient();

interface MaintenanceConfig {
  isMaintenance: boolean;
  showTimer: boolean;
  maintenanceEndTime: string;
  message: string;
}

import { SettingsProvider } from "./hooks/SettingsContext";

const App = () => {
  const [setupCompleted, setSetupCompleted] = useState(() => checkFirstTimeSetup());
  const [maintenanceConfig, setMaintenanceConfig] = useState<MaintenanceConfig | null>(null);
  const [loadingMaintenance, setLoadingMaintenance] = useState(true);
  const [showLoadingUi, setShowLoadingUi] = useState(false);

  useEffect(() => {
    ensureVersion();

    // 只有當讀取超過 200ms 時才顯示載入畫面，避免閃爍
    const loadingTimer = setTimeout(() => {
      setShowLoadingUi(true);
    }, 200);

    const fetchMaintenance = async () => {
      try {
        const response = await fetch("/data/maintenance.json");
        const data = await response.json();
        setMaintenanceConfig(data);
      } catch (error) {
        console.error("Failed to fetch maintenance config:", error);
      } finally {
        setLoadingMaintenance(false);
        clearTimeout(loadingTimer);
      }
    };
    fetchMaintenance();

    return () => clearTimeout(loadingTimer);
  }, []);

  if (loadingMaintenance) {
    return showLoadingUi ? <Loading fullScreen message="正在讀取設定..." /> : null;
  }

  if (maintenanceConfig?.isMaintenance) {
    return (
      <MaintenancePage
        maintenanceEndTime={maintenanceConfig.maintenanceEndTime}
        showTimer={maintenanceConfig.showTimer}
        message={maintenanceConfig.message}
      />
    );
  }

  // 如果尚未完成首次設定，顯示設定畫面
  if (!setupCompleted) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SettingsProvider>
            <FirstTimeSetup onComplete={() => setSetupCompleted(true)} />
          </SettingsProvider>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // 已完成設定，顯示正常應用
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SettingsProvider>
            <UpdatePrompt />
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <ErrorBoundary>
                <Routes>

                  <Route
                    path="/"
                    element={
                      <ErrorBoundary>
                        <Index />
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

                  {/* 在 CATCH-ALL "*" 路由之前添加所有自定義路由 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ErrorBoundary>
            </BrowserRouter>
          </SettingsProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
