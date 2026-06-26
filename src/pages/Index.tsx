import { useMemo, useState } from "react";
import { CommonSites } from "@/components/CommonSites";
import { Announcements } from "@/components/Announcements";
import { CalendarView } from "@/components/CalendarView";
import { CountdownTimer } from "@/components/CountdownTimer";
import { WeatherWidget } from "@/components/WeatherWidget";
import { ToolsSection } from "@/components/ToolsSection";
import { HonorsBoard } from "@/components/HonorsBoard";
import { LunchMenu } from "@/components/LunchMenu";
import { ResponsiveNav, NavPage } from "@/components/ResponsiveNav";
import { SearchPage } from "@/components/SearchPage";
import { SiteAnnouncementsPage } from "@/components/SiteAnnouncementsPage";
import { FavoritesPage } from "@/components/FavoritesPage";
import { SettingsPage } from "@/components/SettingsPage";
import { AdminPanel } from "@/components/AdminPanel";
import { VisitCounter } from "@/components/VisitCounter";
import { useSettings } from "@/hooks/SettingsContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { getPageBackgroundStyle } from "@/lib/page-background";
import { Skeleton } from "@/components/ui/skeleton";
import MaintenanceModal from "@/components/MaintenanceModal";
import { LatestAnnouncementModal } from "@/components/LatestAnnouncementModal";
import { isMaintenanceWhitelisted } from "@/lib/app-version";
import { MaintenanceConfig } from "@/App";
import React from "react";

interface IndexProps {
    maintenanceConfig: MaintenanceConfig | null;
}

const Index = ({ maintenanceConfig }: IndexProps) => {
    const { settings } = useSettings();

    const isMobile = useIsMobile();
    const [currentPage, setCurrentPage] = useState<NavPage>("home");

    // 取得已啟用且排序後的組件
    const enabledComponents = useMemo(
        () =>
            settings.components
                .filter((c) => c.enabled)
                .sort((a, b) => a.order - b.order),
        [settings.components]
    );

    // 渲染首頁組件
    const renderHomePageComponent = (id: string) => {
        if (maintenanceConfig?.isMaintenance && !isMaintenanceWhitelisted()) {
            return (
                <div className="space-y-4 w-full">
                    <Skeleton className="h-48 w-full rounded-2xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            );
        }

        switch (id) {
            case "countdown": return <CountdownTimer key="countdown" />;
            case "weather": return <WeatherWidget key="weather" />;
            case "commonSites": return <CommonSites key="commonSites" />;
            case "tools": return <ToolsSection key="tools" />;
            case "honors": return <HonorsBoard key="honors" />;
            case "announcements": return <Announcements key="announcements" />;
            case "calendar": return <CalendarView key="calendar" />;
            case "lunch": return <LunchMenu key="lunch" />;
            default: return null;
        }
    };

    // 根據標籤渲染頁面內容
    const renderPageContent = () => {
        switch (currentPage) {
            case "search":
                return <SearchPage />;
            case "announcements":
                return <SiteAnnouncementsPage />;
            case "favorites":
                return <FavoritesPage />;
            case "settings":
                return <SettingsPage />;
            case "admin":
                return <AdminPanel />;
            case "home":
            default:
                return (
                    <div className="space-y-12">
                        {enabledComponents.map((component) => (
                            <HomeSection key={component.id} id={component.id}>
                                {renderHomePageComponent(component.id)}
                            </HomeSection>
                        ))}
                        {/* 頁尾上方的訪問計數器 */}
                        <VisitCounter />
                    </div>
                );
        }
    };

    return (
        <div
            className={`h-[100dvh] w-screen max-w-full flex overflow-hidden ${isMobile ? 'flex-col' : 'flex-row'}`}
            style={getPageBackgroundStyle(settings.pageBackground, settings.pageBackgroundImage)}
        >
            {/* 背景裝飾光圈 */}
            <div className="fixed -right-48 -top-48 w-[600px] h-[600px] md:w-[800px] md:h-[800px] rounded-full pointer-events-none z-0"
                style={{ background: 'radial-gradient(circle, hsl(210 100% 70% / 0.05), transparent 70%)' }} />
            <div className="fixed -left-8 -bottom-8 w-[350px] h-[350px] md:w-[450px] md:h-[450px] rounded-full pointer-events-none z-0"
                style={{ background: 'radial-gradient(circle, hsl(190 60% 65% / 0.04), transparent 70%)' }} />

            {/* 桌面版側邊導航 (使用固定定位，所以這裡加一個占位區) */}
            {!isMobile && (
                <>
                    <ResponsiveNav currentPage={currentPage} onPageChange={setCurrentPage} />
                    <div className="w-16 shrink-0" />
                </>
            )}

            {/* 手機版頂部標題列 */}
            {isMobile && (
                <ResponsiveNav currentPage={currentPage} onPageChange={setCurrentPage} mode="header" />
            )}

            {/* 主內容區塊 */}
            <div className="flex-1 flex flex-col min-h-0 w-full overflow-x-hidden relative">
                <main className={`flex-1 overflow-y-auto px-4 lg:p-8 max-w-5xl w-full mx-auto overflow-x-hidden ${isMobile ? 'pt-14 pb-14' : ''}`}>
                    <div className="py-4">
                        {renderPageContent()}
                    </div>

                    {/* 版權資訊 - 在手機版如果不是首頁則隱藏，避免重疊 */}
                    {currentPage === "home" && (
                        <footer className="mt-12 border-t border-primary/20 bg-gradient-to-r from-background to-primary/5 py-12 px-4 lg:px-6 rounded-t-3xl text-center text-sm text-muted-foreground">
                            <div className="flex flex-col items-center gap-1">
                                <p>© 2026 崇明國中 by cy.noc0531</p>

                            </div>
                        </footer>
                    )}
                </main>

                {/* 維護模式彈窗（白名單使用者跳過） */}
                {maintenanceConfig?.isMaintenance && !isMaintenanceWhitelisted() && (
                    <MaintenanceModal
                        isOpen={true}
                        maintenanceEndTime={maintenanceConfig.maintenanceEndTime}
                        showTimer={maintenanceConfig.showTimer}
                        title={maintenanceConfig.title}
                        message={maintenanceConfig.message}
                    />
                )}
                
                {/* 最新公告彈窗 - 只在首頁顯示 */}
                {currentPage === "home" && <LatestAnnouncementModal />}
            </div>

            {/* 手機版底部導航列 */}
            {isMobile && (
                <ResponsiveNav currentPage={currentPage} onPageChange={setCurrentPage} mode="footer" />
            )}
        </div>
    );
};

// 動態區塊包裝器 (已移除動畫)
const HomeSection = ({ children, id }: { children: React.ReactNode; id: string }) => {
    return (
        <div id={id}>
            {children}
        </div>
    );
};

export default Index;
