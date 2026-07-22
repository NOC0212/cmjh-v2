import { useMemo, useState, useTransition, lazy, Suspense } from "react";
import { CommonSites } from "@/components/CommonSites";
import { Announcements } from "@/components/Announcements";
import { CalendarView } from "@/components/CalendarView";
import { CountdownTimer } from "@/components/CountdownTimer";
import { WeatherWidget } from "@/components/WeatherWidget";
import { ToolsSection } from "@/components/ToolsSection";
import { HonorsBoard } from "@/components/HonorsBoard";
import { LunchMenu } from "@/components/LunchMenu";
import { ResponsiveNav, NavPage } from "@/components/ResponsiveNav";
import { VisitCounter } from "@/components/VisitCounter";
import { useSettings } from "@/hooks/SettingsContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { getPageBackgroundStyle } from "@/lib/page-background";
import { Skeleton } from "@/components/ui/skeleton";
import MaintenanceModal from "@/components/MaintenanceModal";
// 代碼分割：子頁面（不常駐顯示）
const SearchPage = lazy(() => import("@/components/SearchPage").then(m => ({ default: m.SearchPage })));
const SiteAnnouncementsPage = lazy(() => import("@/components/SiteAnnouncementsPage").then(m => ({ default: m.SiteAnnouncementsPage })));
const FavoritesPage = lazy(() => import("@/components/FavoritesPage").then(m => ({ default: m.FavoritesPage })));
const SettingsPage = lazy(() => import("@/components/SettingsPage").then(m => ({ default: m.SettingsPage })));
const AdminPanel = lazy(() => import("@/components/AdminPanel").then(m => ({ default: m.AdminPanel })));
const LatestAnnouncementModal = lazy(() => import("@/components/LatestAnnouncementModal").then(m => ({ default: m.LatestAnnouncementModal })));
import { isMaintenanceWhitelisted } from "@/lib/app-version";
import { MaintenanceConfig } from "@/App";
import { cn } from "@/lib/utils";
import { Loading } from "@/components/Loading";

interface IndexProps {
    maintenanceConfig: MaintenanceConfig | null;
}

const componentAnimationClass: Record<string, string> = {
    countdown: "animate-fade-in animate-stagger-1",
    weather: "animate-fade-in animate-stagger-2",
    commonSites: "animate-fade-in animate-stagger-3",
    tools: "animate-fade-in animate-stagger-4",
    honors: "animate-fade-in animate-stagger-5",
    announcements: "animate-fade-in animate-stagger-6",
    calendar: "animate-fade-in animate-stagger-7",
    lunch: "animate-fade-in animate-stagger-8",
};

const Index = ({ maintenanceConfig }: IndexProps) => {
    const { settings } = useSettings();
    const isMobile = useIsMobile();
    const [currentPage, setCurrentPage] = useState<NavPage>("home");
    const [isPending, startTransition] = useTransition();

    const handlePageChange = (page: NavPage) => {
        startTransition(() => setCurrentPage(page));
    };

    const enabledComponents = useMemo(
        () =>
            settings.components
                .filter((c) => c.enabled)
                .sort((a, b) => a.order - b.order),
        [settings.components]
    );

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

    const renderPageContent = () => {
        switch (currentPage) {
            case "search":
                return <Suspense fallback={<Loading message="載入搜尋..." />}><SearchPage /></Suspense>;
            case "announcements":
                return <Suspense fallback={<Loading message="載入公告..." />}><SiteAnnouncementsPage /></Suspense>;
            case "favorites":
                return <Suspense fallback={<Loading message="載入收藏..." />}><FavoritesPage /></Suspense>;
            case "settings":
                return <Suspense fallback={<Loading message="載入設定..." />}><SettingsPage /></Suspense>;
            case "admin":
                return <Suspense fallback={<Loading message="載入管理後台..." />}><AdminPanel /></Suspense>;
            case "home":
            default:
                return (
                        <div className="space-y-10 md:space-y-14">
                        {enabledComponents.map((component) => (
                            <div
                                key={component.id}
                                id={component.id}
                                className={cn("opacity-0", componentAnimationClass[component.id])}
                            >
                                {renderHomePageComponent(component.id)}
                            </div>
                        ))}
                        <div className="opacity-0 animate-fade-in animate-stagger-8">
                            <VisitCounter />
                        </div>
                        <footer className="mt-8 border-t border-border/40 py-8 text-center text-xs text-muted-foreground">
                            <p>&copy; 2026 崇明國中 by cy.noc0531</p>
                        </footer>
                    </div>
                );
        }
    };

    return (
        <div
            className={cn(
                "h-[100dvh] w-screen max-w-full flex overflow-hidden",
                isMobile ? 'flex-col' : 'flex-row'
            )}
            style={getPageBackgroundStyle(settings.pageBackground, settings.pageBackgroundImage)}
        >
            <div className="fixed -right-48 -top-48 w-[600px] h-[600px] md:w-[800px] md:h-[800px] rounded-full pointer-events-none z-0"
                style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.05), transparent 70%)' }} />
            <div className="fixed -left-8 -bottom-8 w-[350px] h-[350px] md:w-[450px] md:h-[450px] rounded-full pointer-events-none z-0"
                style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.03), transparent 70%)' }} />

            {!isMobile && (
                <>
                    <ResponsiveNav currentPage={currentPage} onPageChange={handlePageChange} />
                    <div className="w-16 shrink-0" />
                </>
            )}

            {isMobile && (
                <ResponsiveNav currentPage={currentPage} onPageChange={handlePageChange} mode="header" />
            )}

            <div className="flex-1 flex flex-col min-h-0 w-full overflow-x-hidden relative">
                <main className={cn(
                    "flex-1 overflow-y-auto px-4 lg:px-8 max-w-5xl w-full mx-auto overflow-x-hidden",
                    isMobile ? 'pt-14 pb-14' : 'py-0'
                )}>
                    <div className="py-4 md:py-6">
                        {renderPageContent()}
                    </div>
                </main>

                {maintenanceConfig?.isMaintenance && !isMaintenanceWhitelisted() && (
                    <MaintenanceModal
                        isOpen={true}
                        maintenanceEndTime={maintenanceConfig.maintenanceEndTime}
                        showTimer={maintenanceConfig.showTimer}
                        title={maintenanceConfig.title}
                        message={maintenanceConfig.message}
                    />
                )}

                {currentPage === "home" && (
                    <Suspense fallback={null}>
                        <LatestAnnouncementModal />
                    </Suspense>
                )}
            </div>

            {isMobile && (
                <ResponsiveNav currentPage={currentPage} onPageChange={handlePageChange} mode="footer" />
            )}
        </div>
    );
};

export default Index;
