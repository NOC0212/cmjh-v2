import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { FirstTimeSetup, checkFirstTimeSetup } from "@/components/FirstTimeSetup";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Wheel from "./pages/tools/Wheel";
import Grouping from "./pages/tools/Grouping";
import Order from "./pages/tools/Order";
import Clock from "./pages/tools/Clock";
import Timer from "./pages/tools/Timer";

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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Index />} />

            {/* 工具頁面路由 */}
            <Route path="/tools/wheel" element={<Wheel />} />
            <Route path="/tools/grouping" element={<Grouping />} />
            <Route path="/tools/order" element={<Order />} />
            <Route path="/tools/clock" element={<Clock />} />
            <Route path="/tools/timer" element={<Timer />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
