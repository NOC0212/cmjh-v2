import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSiteConfig } from "@/hooks/use-site-config";
import { useAutoUpdate } from "@/hooks/use-auto-update";
import { SettingsProvider } from "@/hooks/settings-context";
import { FavoritesProvider } from "@/hooks/use-favorites";
import { isMaintenanceWhitelisted, ensureVersion, checkFirstTimeSetup } from "@/lib/app-version";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastProvider } from "@/components/ui/toast";
import { AppLayout } from "@/app/AppLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Loading } from "@/components/Loading";
import { UpdateBadge } from "@/components/UpdateBadge";
import { UpdateDialog } from "@/components/UpdateDialog";
import NotFound from "@/pages/NotFound";
import HomePage from "@/pages/HomePage";
import LandingPage from "@/pages/LandingPage";
import MaintenancePage from "@/pages/MaintenancePage";

// 代碼分割：低頻頁面 lazy loading
const AnnouncementsPage = lazy(() => import("@/pages/AnnouncementsPage"));
const FavoritesPage = lazy(() => import("@/pages/FavoritesPage"));
const SearchPage = lazy(() => import("@/pages/SearchPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const AdminPage = lazy(() => import("@/pages/AdminPage"));
const DocsPage = lazy(() => import("@/pages/DocsPage"));

// 工具頁面（獨立 chunk）
const Wheel = lazy(() => import("@/pages/tools/Wheel"));
const Grouping = lazy(() => import("@/pages/tools/Grouping"));
const Order = lazy(() => import("@/pages/tools/Order"));
const Clock = lazy(() => import("@/pages/tools/Clock"));
const Timer = lazy(() => import("@/pages/tools/Timer"));
const QRCode = lazy(() => import("@/pages/tools/QRCode"));
const Whiteboard = lazy(() => import("@/pages/tools/Whiteboard"));
const Attendance = lazy(() => import("@/pages/tools/Attendance"));

const toolRoutes = [
  { path: "/tools/wheel", Component: Wheel, message: "載入輪盤工具..." },
  { path: "/tools/grouping", Component: Grouping, message: "載入分組工具..." },
  { path: "/tools/order", Component: Order, message: "載入順序工具..." },
  { path: "/tools/clock", Component: Clock, message: "載入時鐘..." },
  { path: "/tools/timer", Component: Timer, message: "載入計時器..." },
  { path: "/tools/qrcode", Component: QRCode, message: "載入 QR Code 工具..." },
  { path: "/tools/whiteboard", Component: Whiteboard, message: "載入電子白板..." },
  { path: "/tools/attendance", Component: Attendance, message: "載入課堂點名..." },
];

export default function App() {
  useEffect(() => {
    ensureVersion();
  }, []);

  return (
    <ErrorBoundary>
      <TooltipProvider delayDuration={200}>
        <ToastProvider>
          <SettingsProvider>
            <FavoritesProvider>
              <AppContent />
            </FavoritesProvider>
          </SettingsProvider>
        </ToastProvider>
      </TooltipProvider>
    </ErrorBoundary>
  );
}

/** 內部元件（SettingsProvider 內） */
function AppContent() {
  const { maintenance, isLoading: loadingMaintenance } = useSiteConfig();
  const { latestVersion, showUpdateDialog, updateInfo, dismissUpdateDialog } = useAutoUpdate();

  const handleUpdateClose = () => {
    dismissUpdateDialog();
    // 通知公告彈窗可顯示
    window.dispatchEvent(new CustomEvent("update-prompt-closed"));
  };

  if (loadingMaintenance && !maintenance) {
    return <Loading fullScreen message="正在讀取設定..." />;
  }

  // 維護白名單：管理者可在維護模式中正常使用
  const bypassMaintenance = maintenance?.isMaintenance && isMaintenanceWhitelisted();
  const effectiveMaintenance = !bypassMaintenance && maintenance?.isMaintenance;

  return (
    <>
      <UpdateBadge latestVersion={latestVersion} />
      <UpdateDialog open={showUpdateDialog} updateInfo={updateInfo} onClose={handleUpdateClose} />

      {effectiveMaintenance && maintenance ? (
        <MaintenancePage
          maintenanceEndTime={maintenance.maintenanceEndTime}
          showTimer={maintenance.showTimer}
          title={maintenance.title}
          message={maintenance.message}
        />
      ) : (
        <Routes>
          {/* 工具頁 */}
          {toolRoutes.map(({ path, Component, message }) => (
            <Route
              key={path}
              path={path}
              element={
                <Suspense fallback={<Loading fullScreen message={message} />}>
                  <Component />
                </Suspense>
              }
            />
          ))}

          {/* 登陸頁 /home */}
          <Route path="/home" element={<LandingPage />} />

          {/* 主應用 */}
          <Route element={<AppLayout />} errorElement={<ErrorBoundary><></></ErrorBoundary>}>
            {/* 未完成首次體驗 → /home；已完成 → /app */}
            <Route
              path="/"
              element={
                <Navigate to={checkFirstTimeSetup() ? "/app" : "/home"} replace />
              }
            />
            <Route path="/app" element={<HomePage />} />
            <Route
              path="/announcements"
              element={
                <Suspense fallback={<Loading message="載入公告..." />}>
                  <AnnouncementsPage />
                </Suspense>
              }
            />
            <Route
              path="/favorites"
              element={
                <Suspense fallback={<Loading message="載入收藏..." />}>
                  <FavoritesPage />
                </Suspense>
              }
            />
            <Route
              path="/search"
              element={
                <Suspense fallback={<Loading message="載入搜尋..." />}>
                  <SearchPage />
                </Suspense>
              }
            />
            <Route
              path="/settings"
              element={
                <Suspense fallback={<Loading message="載入設定..." />}>
                  <SettingsPage />
                </Suspense>
              }
            />
            <Route
              path="/admin"
              element={
                <Suspense fallback={<Loading message="載入管理後台..." />}>
                  <AdminPage />
                </Suspense>
              }
            />
            <Route
              path="/docs"
              element={
                <Suspense fallback={<Loading message="載入說明頁面..." />}>
                  <DocsPage />
                </Suspense>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      )}
    </>
  );
}
