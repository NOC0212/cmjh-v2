import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/settings-context";
import { VisitCounter } from "@/components/VisitCounter";
import { CountdownTimer } from "@/features/home/CountdownTimer";
import { WeatherWidget } from "@/features/home/WeatherWidget";
import { CommonSites } from "@/features/home/CommonSites";
import { HonorsBoard } from "@/features/home/HonorsBoard";
import { CalendarView } from "@/features/home/CalendarView";
import { LunchMenu } from "@/features/home/LunchMenu";

interface HomePageProps {
  maintenanceOnly?: boolean;
}

const staggerClass: Record<string, string> = {
  countdown: "animate-fade-in animate-stagger-1",
  weather: "animate-fade-in animate-stagger-2",
  commonSites: "animate-fade-in animate-stagger-3",
  honors: "animate-fade-in animate-stagger-5",
  calendar: "animate-fade-in animate-stagger-7",
  lunch: "animate-fade-in animate-stagger-8",
};

export default function HomePage({ maintenanceOnly = false }: HomePageProps) {
  const { settings } = useSettings();

  const enabledComponents = useMemo(
    () =>
      settings.components
        .filter((c) => c.enabled)
        .sort((a, b) => a.order - b.order),
    [settings.components],
  );

  const renderComponent = (id: string) => {
    switch (id) {
      case "countdown": return <CountdownTimer key="countdown" />;
      case "weather": return <WeatherWidget key="weather" />;
      case "commonSites": return <CommonSites key="commonSites" />;
      case "honors": return <HonorsBoard key="honors" />;
      case "calendar": return <CalendarView key="calendar" />;
      case "lunch": return <LunchMenu key="lunch" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-10 md:space-y-14">
      {enabledComponents.map((component) => (
        <div
          key={component.id}
          id={component.id}
          className={cn("opacity-0", staggerClass[component.id])}
        >
          {renderComponent(component.id)}
        </div>
      ))}

      {enabledComponents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/30 p-8 max-w-md">
            <p className="text-muted-foreground">目前沒有啟用的頁面區塊</p>
            <p className="text-xs text-muted-foreground/60 mt-2">
              請前往「設定」開啟需要的功能
            </p>
          </div>
        </div>
      )}

      {!maintenanceOnly && (
        <>
          <div className="opacity-0 animate-fade-in animate-stagger-8">
            <VisitCounter />
          </div>
          <footer className="mt-8 border-t border-border/40 py-8 text-center text-xs text-muted-foreground">
            <p>© 2026 崇明國中v2 by cy.noc0531</p>
          </footer>
        </>
      )}
    </div>
  );
}
