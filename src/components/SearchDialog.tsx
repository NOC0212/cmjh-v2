import { useState, useEffect } from "react";
import { Search, ExternalLink, Calendar as CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useComponentSettings } from "@/hooks/useComponentSettings";

interface Announcement {
  date: string;
  title: string;
  url: string;
}

interface CalendarEvent {
  date: string;
  title: string;
}

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const { visibility } = useComponentSettings();

  useEffect(() => {
    // 根據用戶設定條件載入資料
    type DataResult = { type: "announcements"; data: Announcement[] } | { type: "calendar"; data: Record<string, CalendarEvent[]> };
    const promises: Promise<DataResult>[] = [];

    if (visibility.announcements) {
      promises.push(
        fetch("/data/announcements.json")
          .then((res) => res.json())
          .then((data) => ({ type: "announcements", data }))
      );
    }

    if (visibility.calendar) {
      promises.push(
        fetch("/data/calendar.json")
          .then((res) => res.json())
          .then((data) => ({ type: "calendar", data }))
      );
    }

    if (promises.length > 0) {
      Promise.all(promises).then((results) => {
        results.forEach((result) => {
          if (result.type === "announcements") {
            setAnnouncements(result.data);
          } else if (result.type === "calendar") {
            const events: CalendarEvent[] = [];
            Object.values(result.data as Record<string, CalendarEvent[]>).forEach((monthEvents) => {
              events.push(...monthEvents);
            });
            setCalendarEvents(events);
          }
        });
      });
    }
  }, [visibility.announcements, visibility.calendar]);

  const filteredAnnouncements = announcements.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase())
  );

  const filteredEvents = calendarEvents.filter((e) =>
    e.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">搜尋</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>搜尋公告與事件</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="輸入關鍵字搜尋..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full"
            autoFocus
          />
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {query && (
                <>
                  {filteredAnnouncements.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                        行政公告 ({filteredAnnouncements.length})
                      </h3>
                      <div className="space-y-2">
                        {filteredAnnouncements.map((item, idx) => (
                          <a
                            key={idx}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all"
                            onClick={() => setOpen(false)}
                          >
                            <ExternalLink className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-foreground">
                                {item.title}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {item.date}
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {filteredEvents.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                        行事曆 ({filteredEvents.length})
                      </h3>
                      <div className="space-y-2">
                        {filteredEvents.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 p-3 rounded-lg border border-border"
                          >
                            <CalendarIcon className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-foreground">
                                {item.title}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {item.date}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {filteredAnnouncements.length === 0 &&
                    filteredEvents.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        沒有找到相關結果
                      </div>
                    )}
                </>
              )}
              {!query && (
                <div className="text-center text-muted-foreground py-8">
                  請輸入關鍵字開始搜尋
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
