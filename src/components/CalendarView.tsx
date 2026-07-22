import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CalendarDialog } from "@/components/CalendarDialog";
import { CalendarAddDialog } from "@/components/CalendarAddDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  date: string;
  title: string;
  isCustom?: boolean;
}

type CalendarData = Record<string, CalendarEvent[]>;

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

const formatMonthLabel = (monthKey: string) => {
  const [year, month] = monthKey.split("-");
  return `${year} 年 ${parseInt(month, 10)} 月`;
};

const formatDayLabel = (monthKey: string, day: number) => {
  const [year, month] = monthKey.split("-");
  return `${year} 年 ${parseInt(month, 10)} 月 ${day} 日`;
};

export function CalendarView() {
  const [calendarData, setCalendarData] = useState<CalendarData>({});
  const [selectedMonth, setSelectedMonth] = useState("");
  const [openDay, setOpenDay] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { customEvents } = useCalendarEvents();

  useEffect(() => {
    fetch("/data/calendar.json")
      .then((res) => { if (!res.ok) throw new Error("Failed to fetch calendar"); return res.json(); })
      .then((data: CalendarData) => {
        const normalizedData: CalendarData = {};
        Object.keys(data).forEach((month) => {
          normalizedData[month] = data[month].map((event) => ({
            ...event,
            isCustom: false,
          }));
        });
        const today = new Date();
        const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
        const sortedMonths = Object.keys(normalizedData).sort();
        const initialMonth = sortedMonths.includes(currentMonth) ? currentMonth : sortedMonths[0] || "";
        setCalendarData(normalizedData);
        setSelectedMonth(initialMonth);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const mergedCalendarData = useMemo(() => {
    const merged: CalendarData = { ...calendarData };
    customEvents.forEach((event) => {
      const monthKey = event.date.slice(0, 7);
      if (!merged[monthKey]) merged[monthKey] = [];
      merged[monthKey] = [...merged[monthKey], event];
    });
    Object.keys(merged).forEach((month) => {
      merged[month] = [...merged[month]].sort((a, b) => a.date.localeCompare(b.date));
    });
    return merged;
  }, [calendarData, customEvents]);

  const months = useMemo(() => Object.keys(mergedCalendarData).sort(), [mergedCalendarData]);
  const currentMonthIndex = useMemo(() => months.indexOf(selectedMonth), [months, selectedMonth]);

  const eventsByDay = useMemo(() => {
    if (!selectedMonth || !mergedCalendarData[selectedMonth]) return {};
    return mergedCalendarData[selectedMonth].reduce<Record<number, CalendarEvent[]>>((acc, event) => {
      const day = parseInt(event.date.split("-")[2], 10);
      if (!acc[day]) acc[day] = [];
      acc[day].push(event);
      return acc;
    }, {});
  }, [mergedCalendarData, selectedMonth]);

  const handlePrevMonth = () => {
    if (currentMonthIndex <= 0) return;
    setSelectedMonth(months[currentMonthIndex - 1]);
    setOpenDay(null);
  };

  const handleNextMonth = () => {
    if (currentMonthIndex >= months.length - 1) return;
    setSelectedMonth(months[currentMonthIndex + 1]);
    setOpenDay(null);
  };

  const renderEventPopover = (day: number, dayEvents: CalendarEvent[]) => (
    <Popover open={openDay === day} onOpenChange={(open) => setOpenDay(open ? day : null)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "aspect-square w-full rounded-lg border transition-all p-1.5 md:p-2",
            openDay === day
              ? "border-primary bg-primary/10 ring-2 ring-primary/15"
              : "border-border/60 bg-card hover:border-primary/30 hover:bg-primary/5",
            dayEvents.length > 0 && "font-medium"
          )}
        >
          <div className="flex h-full flex-col justify-between">
            <div className="flex items-start justify-between gap-0.5">
              <span className={cn(
                "text-xs md:text-sm lg:text-base leading-none font-medium",
                openDay === day ? "text-primary font-bold" : "text-foreground"
              )}>
                {day}
              </span>
              {dayEvents.length > 0 && (
                <span className={cn(
                  "rounded-full px-1 py-0.5 text-[9px] md:text-[10px] font-semibold leading-none",
                  dayEvents.some(e => e.isCustom)
                    ? "bg-accent/15 text-accent"
                    : "bg-primary/10 text-primary"
                )}>
                  {dayEvents.length}
                </span>
              )}
            </div>
            {dayEvents.length > 0 && (
              <div className="flex gap-1 justify-center mt-0.5 md:mt-1">
                {dayEvents.slice(0, 3).map((event, index) => (
                  <span
                    key={`${event.date}-${event.title}-${index}`}
                    className={cn(
                      "rounded-full",
                      event.isCustom ? "bg-accent" : "bg-primary",
                      "h-1.5 w-1.5 md:h-2 md:w-2"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent align="center" className="w-64 rounded-xl p-3 shadow-lg" sideOffset={8}>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">{formatDayLabel(selectedMonth, day)}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {dayEvents.length > 0 ? `共有 ${dayEvents.length} 項事件` : "這一天沒有事件"}
            </p>
          </div>
          {dayEvents.length > 0 ? (
            <div className="space-y-1.5">
              {dayEvents.map((event, index) => (
                <div key={`${event.date}-${event.title}-${index}`} className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium text-foreground">{event.title}</p>
                    <span className={cn(
                      "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
                      event.isCustom ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary"
                    )}>
                      {event.isCustom ? "自訂" : "學校"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-muted/10 p-3 text-center text-xs text-muted-foreground">
              目前沒有安排事件。
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );

  const renderCalendarCells = () => {
    if (!selectedMonth) return null;
    const [year, month] = selectedMonth.split("-").map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startWeekday = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const today = new Date();
    const cells: React.ReactNode[] = [];

    WEEKDAYS.forEach((weekday) => {
      cells.push(
        <div key={`header-${weekday}`} className="py-1.5 md:py-2 text-center text-[11px] md:text-xs font-semibold text-muted-foreground">
          {weekday}
        </div>
      );
    });

    for (let i = 0; i < startWeekday; i += 1) {
      cells.push(<div key={`empty-${i}`} />);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dayEvents = eventsByDay[day] || [];
      const isToday = year === today.getFullYear() && month === today.getMonth() + 1 && day === today.getDate();
      cells.push(
        <div key={`day-${day}`} className="relative">
          {renderEventPopover(day, dayEvents)}
          {isToday && (
            <span className="absolute -top-0.5 -right-0.5 rounded-full bg-primary px-1 py-0.5 text-[8px] font-bold leading-none text-primary-foreground shadow-sm">
              今
            </span>
          )}
        </div>
      );
    }

    return cells;
  };

  if (loading) {
    return (
      <section id="calendar">
        <div className="mb-6 h-8 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="rounded-2xl border border-border/60 bg-card p-4">
          <div className="py-12 text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-r-transparent" />
            <p className="mt-3 text-sm text-muted-foreground">載入行事曆中...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="calendar">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="section-header-icon">
            <CalendarDays className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-bold text-foreground">行事曆</h2>
          <div className="flex items-center gap-1">
            <CalendarAddDialog availableMonths={months} />
            <CalendarDialog availableMonths={months} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <div className="flex items-center justify-between gap-2 p-3 border-b border-border/40 bg-muted/20">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={handlePrevMonth} disabled={currentMonthIndex <= 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Select
            value={selectedMonth}
            onValueChange={(value) => { setSelectedMonth(value); setOpenDay(null); }}
          >
            <SelectTrigger className="w-[160px] h-9 rounded-lg border-border/40 bg-background text-xs font-medium">
              <SelectValue placeholder="選擇月份" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month} className="text-xs">
                  {formatMonthLabel(month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={handleNextMonth} disabled={currentMonthIndex >= months.length - 1}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <motion.div
          key={selectedMonth}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="p-3"
        >
          <div className="grid grid-cols-7 gap-1.5 md:gap-2">{renderCalendarCells()}</div>
        </motion.div>
      </div>
    </section>
  );
}
