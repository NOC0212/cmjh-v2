import { useMemo, useState } from "react";
import { CommonSites } from "@/components/CommonSites";
import { Announcements } from "@/components/Announcements";
import { CalendarView } from "@/components/CalendarView";
import { CountdownTimer } from "@/components/CountdownTimer";
import { WeatherWidget } from "@/components/WeatherWidget";
import { ToolsSection } from "@/components/ToolsSection";
import { HonorsBoard } from "@/components/HonorsBoard";
import { ResponsiveNav, NavPage } from "@/components/ResponsiveNav";
import { SearchPage } from "@/components/SearchPage";
import { SiteAnnouncementsPage } from "@/components/SiteAnnouncementsPage";
import { FavoritesPage } from "@/components/FavoritesPage";
import { SettingsPage } from "@/components/SettingsPage";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useComponentSettings } from "@/hooks/useComponentSettings";
import { useIsMobile } from "@/hooks/use-mobile";
import React from "react";

const Index = () => {
    const { settings } = useComponentSettings();
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
        switch (id) {
            case "countdown": return <CountdownTimer key="countdown" />;
            case "weather": return <WeatherWidget key="weather" />;
            case "commonSites": return <CommonSites key="commonSites" />;
            case "tools": return <ToolsSection key="tools" />;
            case "honors": return <HonorsBoard key="honors" />;
            case "announcements": return <Announcements key="announcements" />;
            case "calendar": return <CalendarView key="calendar" />;
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
            case "home":
            default:
                return (
                    <div className="space-y-12">
                        {enabledComponents.map((component) => (
                            <HomeSection key={component.id} id={component.id}>
                                {renderHomePageComponent(component.id)}
                            </HomeSection>
                        ))}
                    </div>
                );
        }
    };

    return (
        <div className={`h-[100dvh] w-full flex overflow-hidden bg-background ${isMobile ? 'flex-col' : 'flex-row'}`}>
            {/* 桌面版側邊導航 (作為 Flex 項目而非 fixed) */}
            {!isMobile && <ResponsiveNav currentPage={currentPage} onPageChange={setCurrentPage} />}

            {/* 手機版頂部標題列 */}
            {isMobile && (
                <ResponsiveNav currentPage={currentPage} onPageChange={setCurrentPage} mode="header" />
            )}

            {/* 主內容區塊 */}
            <div className="flex-1 flex flex-col min-h-0">
                <main className="flex-1 overflow-y-auto px-4 lg:p-8 max-w-5xl w-full mx-auto">
                    <div className="py-4">
                        {renderPageContent()}
                    </div>

                    {/* 版權資訊 */}
                    {currentPage === "home" && (
                        <footer className="mt-12 border-t border-primary/20 bg-gradient-to-r from-background to-primary/5 py-12 px-4 lg:px-6 rounded-t-3xl text-center text-sm text-muted-foreground">
                            <p>© 2025 崇明國中 by nocfond</p>
                        </footer>
                    )}
                </main>
            </div>

            {/* 手機版底部導航列 */}
            {isMobile && (
                <ResponsiveNav currentPage={currentPage} onPageChange={setCurrentPage} mode="footer" />
            )}
        </div>
    );
};

// 動態區塊包裝器
const HomeSection = ({ children, id }: { children: React.ReactNode; id: string }) => {
    const { ref, isVisible } = useScrollAnimation();
    return (
        <div
            id={id}
            ref={ref}
            className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
            {children}
        </div>
    );
};

export default Index;
