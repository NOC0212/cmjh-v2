import { useMemo } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { CommonSites } from "@/components/CommonSites";
import { Announcements } from "@/components/Announcements";
import { CalendarView } from "@/components/CalendarView";
import { SearchDialog } from "@/components/SearchDialog";
import { FavoritesDialog } from "@/components/FavoritesDialog";
import { SettingsDialog } from "@/components/SettingsDialog";
import { CountdownTimer } from "@/components/CountdownTimer";
import { WeatherWidget } from "@/components/WeatherWidget";
import { ToolsSection } from "@/components/ToolsSection";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useComponentSettings } from "@/hooks/useComponentSettings";
import { School } from "lucide-react";

const Index = () => {
  const { settings } = useComponentSettings();
  const commonSitesAnim = useScrollAnimation();
  const announcementsAnim = useScrollAnimation();
  const calendarAnim = useScrollAnimation();
  const countdownAnim = useScrollAnimation();
  const weatherAnim = useScrollAnimation();

  // 獲取已啟用並排序的組件
  const enabledComponents = useMemo(
    () =>
      settings.components
        .filter((c) => c.enabled)
        .sort((a, b) => a.order - b.order),
    [settings.components]
  );

  // 組件映射 (包含動畫) - 使用 useMemo 緩存
  const componentMap: Record<string, { element: JSX.Element; anim: ReturnType<typeof useScrollAnimation> }> = useMemo(
    () => ({
      countdown: {
        element: <CountdownTimer />,
        anim: countdownAnim,
      },
      weather: {
        element: <WeatherWidget />,
        anim: weatherAnim,
      },
      commonSites: {
        element: <CommonSites />,
        anim: commonSitesAnim,
      },
      tools: {
        element: <ToolsSection />,
        anim: commonSitesAnim, // 重用 commonSitesAnim
      },
      announcements: {
        element: <Announcements />,
        anim: announcementsAnim,
      },
      calendar: {
        element: <CalendarView />,
        anim: calendarAnim,
      },
    }),
    [countdownAnim, weatherAnim, commonSitesAnim, announcementsAnim, calendarAnim]
  );

  return (
    <div className="min-h-screen flex w-full bg-background">
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-40 bg-gradient-to-r from-background via-background to-primary/5 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-primary/20">
          <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 bg-primary/10 rounded-lg">
                <School className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                崇明國中
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <SearchDialog />
              <FavoritesDialog />
              <SettingsDialog />
              <AppSidebar />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <div className="space-y-12">
            {enabledComponents.map((component) => {
              const { element, anim } = componentMap[component.id];
              return (
                <div
                  key={component.id}
                  id={component.id}
                  ref={anim.ref}
                  className={`transition-all duration-700 ${anim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
                >
                  {element}
                </div>
              );
            })}
          </div>
        </main>

        <footer className="border-t border-primary/20 bg-gradient-to-r from-background to-primary/5 py-6 px-4 lg:px-6">
          <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
            <p>© 2025 崇明國中 by nocfond</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
