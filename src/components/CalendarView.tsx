import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarEvent {
  date: string;
  title: string;
}

type CalendarData = {
  [key: string]: CalendarEvent[];
};

export function CalendarView() {
  const [calendarData, setCalendarData] = useState<CalendarData>({});
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    fetch("/data/calendar.json")
      .then((res) => res.json())
      .then((data: CalendarData) => {
        setCalendarData(data);
        // Set current month or closest available month
        const today = new Date();
        const currentYM = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
        const months = Object.keys(data).sort();
        setSelectedMonth(months.includes(currentYM) ? currentYM : months[0] || "");
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load calendar:", error);
        setLoading(false);
      });
  }, []);

  const months = useMemo(() => Object.keys(calendarData).sort(), [calendarData]);
  const currentMonthIndex = useMemo(() => months.indexOf(selectedMonth), [months, selectedMonth]);

  const handlePrevMonth = () => {
    if (currentMonthIndex > 0) {
      setDirection('left');
      setSelectedDay(null);
      setSelectedMonth(months[currentMonthIndex - 1]);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex < months.length - 1) {
      setDirection('right');
      setSelectedDay(null);
      setSelectedMonth(months[currentMonthIndex + 1]);
    }
  };

  const eventsByDay = useMemo(() => {
    if (!selectedMonth || !calendarData[selectedMonth]) return {};
    
    const events = calendarData[selectedMonth];
    const grouped: { [key: number]: CalendarEvent[] } = {};
    events.forEach((event) => {
      const day = parseInt(event.date.split("-")[2], 10);
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(event);
    });
    return grouped;
  }, [selectedMonth, calendarData]);

  const renderCalendar = () => {
    if (!selectedMonth || !calendarData[selectedMonth]) return null;

    const [year, month] = selectedMonth.split("-").map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startWeekday = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const today = new Date();

    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    const calendarCells = [];

    // Weekday headers
    weekdays.forEach((day) => {
      calendarCells.push(
        <div key={`header-${day}`} className="text-center font-semibold text-muted-foreground py-3 text-sm md:text-base">
          {day}
        </div>
      );
    });

    // Empty cells before first day
    for (let i = 0; i < startWeekday; i++) {
      calendarCells.push(<div key={`empty-${i}`} className="min-h-[100px] md:min-h-[100px]" />);
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        year === today.getFullYear() &&
        month === today.getMonth() + 1 &&
        day === today.getDate();

      const dayEvents = eventsByDay[day] || [];

      const isSelected = selectedDay === day;
      const hasEvents = dayEvents.length > 0;

      // 如果是選中的日期，佔滿整週
      if (isSelected) {
        calendarCells.push(
          <div
            key={`day-${day}`}
            onClick={() => setSelectedDay(null)}
            className="col-span-7 bg-primary/5 border-2 border-primary rounded-lg p-4 cursor-pointer transition-all hover:bg-primary/10"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">{day}</span>
                {isToday && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                    今天
                  </span>
                )}
              </div>
              <span className="text-sm text-muted-foreground">點擊收起</span>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {dayEvents.length > 0 ? (
                dayEvents.map((event, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-card p-3 rounded-md border border-border">
                    <span className="text-primary text-xl">•</span>
                    <span className="text-sm text-card-foreground flex-1">{event.title}</span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  本日無事件
                </div>
              )}
            </div>
          </div>
        );
        continue;
      }

      calendarCells.push(
        <div
          key={`day-${day}`}
          onClick={() => setSelectedDay(day)}
          className={`min-h-[80px] md:min-h-[100px] p-1.5 md:p-3 rounded-lg border transition-all cursor-pointer ${
            isToday
              ? "bg-primary/10 border-primary ring-2 ring-primary/20"
              : "bg-card border-border hover:border-primary/50 hover:bg-primary/5"
          }`}
        >
          <div className="font-semibold mb-1 flex items-center justify-between">
            <span className={`text-xs md:text-base ${isToday ? "text-primary" : "text-foreground"}`}>
              {day}
            </span>
            {isToday && (
              <span className="text-[8px] md:text-xs bg-primary text-primary-foreground px-1 md:px-2 py-0.5 rounded">
                今天
              </span>
            )}
          </div>
          <div className="space-y-0.5">
            {/* 桌面版：顯示前2個事件 */}
            <div className="hidden md:block">
              {dayEvents.slice(0, 2).map((event, idx) => (
                <div key={idx} className="text-xs text-muted-foreground line-clamp-2 mb-0.5">
                  • {event.title}
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div className="text-xs text-primary font-medium">
                  +{dayEvents.length - 2}
                </div>
              )}
            </div>
            {/* 手機版：顯示事件數量 */}
            <div className="md:hidden">
              {dayEvents.length > 0 && (
                <div className="text-[9px] text-primary font-medium">
                  {dayEvents.length} 個事件
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return calendarCells;
  };

  const selectedEvents = selectedMonth ? calendarData[selectedMonth] || [] : [];

  if (loading) {
    return (
      <section id="calendar" className="mb-12 scroll-mt-20">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-muted-foreground mt-4">載入中...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="calendar" className="mb-12 scroll-mt-20">
      <div className="relative rounded-2xl p-8 border border-primary/20 overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-500"
           style={{ background: 'var(--gradient-calendar)' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">行事曆</h2>
            <div className="flex items-center gap-3 bg-background/50 backdrop-blur-sm rounded-full p-1.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevMonth}
                disabled={currentMonthIndex === 0}
                className="h-9 w-9 hover:bg-primary/20 disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px] border-primary/20 bg-background/70 backdrop-blur-sm hover:border-primary/40 transition-colors">
                  <SelectValue placeholder="選擇月份" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
                disabled={currentMonthIndex === months.length - 1}
                className="h-9 w-9 hover:bg-primary/20 disabled:opacity-30 transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div 
            key={selectedMonth}
            className={`grid grid-cols-7 gap-2 bg-background/30 backdrop-blur-sm rounded-xl p-4 border border-border/50 ${
              direction === 'left' ? 'animate-in slide-in-from-left' : 'animate-in slide-in-from-right'
            } duration-300`}
          >
            {renderCalendar()}
          </div>
        </div>
      </div>

      {selectedEvents.length > 0 && (
        <div className="mt-8 relative rounded-2xl p-8 border border-primary/20 overflow-hidden shadow-[var(--shadow-card)]"
             style={{ background: 'var(--gradient-calendar)' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 opacity-50"></div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6">
              本月活動 ({selectedEvents.length})
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {selectedEvents.map((event, idx) => (
                <div
                  key={idx}
                  className="group bg-background/60 backdrop-blur-sm rounded-xl p-5 border border-border/50 hover:border-primary/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-gradient-to-br from-primary/20 to-accent/20 text-primary rounded-xl px-4 py-2.5 text-sm font-bold border border-primary/20 group-hover:border-primary/40 transition-colors">
                      {event.date.split("-")[2]}日
                    </div>
                    <p className="text-foreground flex-1 leading-relaxed group-hover:text-primary transition-colors">{event.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
