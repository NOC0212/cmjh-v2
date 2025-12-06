import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, lazy, Suspense } from "react";
import { FirstTimeSetup, checkFirstTimeSetup } from "@/components/FirstTimeSetup";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Loading } from "@/components/Loading";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// 代碼分割：工具頁面使用 lazy loading
const Wheel = lazy(() => import("./pages/tools/Wheel"));
const Grouping = lazy(() => import("./pages/tools/Grouping"));
const Order = lazy(() => import("./pages/tools/Order"));
const Clock = lazy(() => import("./pages/tools/Clock"));
const Timer = lazy(() => import("./pages/tools/Timer"));

const queryClient = new QueryClient();

const App = () => {
  const [setupCompleted, setSetupCompleted] = useState(() => checkFirstTimeSetup());

  // 如果尚未完成首次設定，顯示設定畫面
  if (!setupCompleted) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <FirstTimeSetup onComplete={() => setSetupCompleted(true)} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // 已完成設定，顯示正常應用
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
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

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
