import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CalendarDialog } from "@/components/CalendarDialog";
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
      .then((res) => res.json())
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
      .catch((error) => {
        console.error("Failed to load calendar:", error);
        setLoading(false);
      });
  }, []);

  const mergedCalendarData = useMemo(() => {
    const merged: CalendarData = { ...calendarData };

    customEvents.forEach((event) => {
      const monthKey = event.date.slice(0, 7);
      if (!merged[monthKey]) {
        merged[monthKey] = [];
      }
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
      if (!acc[day]) {
        acc[day] = [];
      }
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
          className={`aspect-square w-full min-w-0 rounded-md border p-1.5 transition-all md:rounded-2xl md:p-3 ${
            openDay === day
              ? "border-primary bg-primary/10 shadow-sm ring-2 ring-primary/15"
              : "border-border/70 bg-background/85 hover:border-primary/40 hover:bg-primary/5"
          }`}
        >
          <div className="flex h-full flex-col justify-between">
            <div className="flex items-start justify-between gap-1">
              <span className="text-sm font-bold leading-none text-foreground md:text-base">
                {day}
              </span>
              {dayEvents.length > 0 && (() => {
                const hasCustom = dayEvents.some((event) => event.isCustom);
                const hasDefault = dayEvents.some((event) => !event.isCustom);
                const badgeClass = hasCustom && hasDefault
                  ? "bg-gradient-to-r from-primary/15 to-accent/20 text-foreground"
                  : hasCustom
                    ? "bg-accent/15 text-accent"
                    : "bg-primary/10 text-primary";

                return (
                  <span className={`rounded-full px-1 py-0.5 text-[9px] font-semibold leading-none md:px-1.5 md:text-[10px] ${badgeClass}`}>
                    {dayEvents.length}
                  </span>
                );
              })()}
            </div>

            <div className="flex justify-center gap-1">
              {dayEvents.slice(0, 3).map((event, index) => (
                <span
                  key={`${event.date}-${event.title}-${index}`}
                  className={`h-1.5 w-1.5 rounded-full ${
                    event.isCustom ? "bg-accent" : "bg-primary"
                  }`}
                />
              ))}
            </div>
          </div>
        </button>
      </PopoverTrigger>

      <PopoverContent align="center" className="w-72 rounded-2xl p-4">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {formatDayLabel(selectedMonth, day)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {dayEvents.length > 0 ? `共有 ${dayEvents.length} 項事件` : "這一天沒有事件"}
            </p>
          </div>

          {dayEvents.length > 0 ? (
            <div className="space-y-2">
              {dayEvents.map((event, index) => (
                <div
                  key={`${event.date}-${event.title}-${index}`}
                  className="rounded-xl border border-border/70 bg-muted/25 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">{event.title}</p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        event.isCustom
                          ? "bg-accent/15 text-accent"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {event.isCustom ? "自訂" : "學校"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/10 p-4 text-center text-sm text-muted-foreground">
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
    const cells = [];

    WEEKDAYS.forEach((weekday) => {
      cells.push(
        <div
          key={`header-${weekday}`}
          className="py-2 text-center text-xs font-semibold tracking-wide text-muted-foreground md:text-sm"
        >
          {weekday}
        </div>
      );
    });

    for (let i = 0; i < startWeekday; i += 1) {
      cells.push(
        <div
          key={`empty-${i}`}
          className="aspect-square w-full min-w-0 rounded-md border border-transparent md:rounded-2xl"
        />
      );
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dayEvents = eventsByDay[day] || [];
      const isToday =
        year === today.getFullYear() &&
        month === today.getMonth() + 1 &&
        day === today.getDate();

      cells.push(
        <div key={`day-${day}`} className="relative min-w-0">
          {renderEventPopover(day, dayEvents)}
          {isToday && (
            <div className="pointer-events-none absolute inset-x-0 -bottom-2 flex justify-center md:inset-auto md:bottom-2 md:left-2 md:right-auto">
              <span className="rounded-full border border-background bg-primary px-1.5 py-0.5 text-[9px] font-semibold leading-none text-primary-foreground shadow-sm md:px-2 md:text-[10px]">
                今
              </span>
            </div>
          )}
        </div>
      );
    }

    const trailingEmptyCount = 42 - startWeekday - daysInMonth;
    for (let i = 0; i < trailingEmptyCount; i += 1) {
      cells.push(
        <div
          key={`trailing-empty-${i}`}
          className="aspect-square w-full min-w-0 rounded-md border border-transparent md:rounded-2xl"
        />
      );
    }

    return cells;
  };

  if (loading) {
    return (
      <section id="calendar" className="mb-12 scroll-mt-20">
        <div className="py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
          <p className="mt-4 text-muted-foreground">載入行事曆中...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="calendar" className="mb-12 scroll-mt-20">
      <div
        className="image-bg-surface relative overflow-hidden rounded-3xl border border-primary/15 p-4 shadow-[var(--shadow-card)] sm:p-6"
        style={{ background: "var(--gradient-calendar)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

        <div className="relative z-10 space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-foreground md:text-3xl">行事曆</h2>
                <CalendarDialog />
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedMonth ? formatMonthLabel(selectedMonth) : "選擇月份查看行程"}
              </p>
            </div>

            <div className="image-bg-panel flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-background/80 p-2 backdrop-blur-sm">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevMonth}
                disabled={currentMonthIndex <= 0}
                className="h-9 w-9 rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Select
                value={selectedMonth}
                onValueChange={(value) => {
                  setSelectedMonth(value);
                  setOpenDay(null);
                }}
              >
                <SelectTrigger className="w-[170px] rounded-full border-primary/15 bg-background">
                  <SelectValue placeholder="選擇月份" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {formatMonthLabel(month)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
                disabled={currentMonthIndex >= months.length - 1}
                className="h-9 w-9 rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <motion.div
            key={selectedMonth}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="image-bg-panel rounded-3xl border border-border/60 bg-background/75 p-3 backdrop-blur-sm md:p-4"
          >
            <div className="grid grid-cols-7 gap-2">{renderCalendarCells()}</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
