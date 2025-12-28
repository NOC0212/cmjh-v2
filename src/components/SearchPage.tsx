import { useState, useEffect } from "react";
import { Search, ExternalLink, Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Announcement {
    date: string;
    title: string;
    url: string;
}

interface Honor {
    date: string;
    title: string;
    url: string;
}

interface CalendarEvent {
    date: string;
    title: string;
}

export function SearchPage() {
    const [query, setQuery] = useState("");
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [honors, setHonors] = useState<Honor[]>([]);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

    // 初始化載入公告、榮譽榜與行事曆數據（無論組件是否啟用）
    useEffect(() => {
        type DataResult =
            | { type: "announcements"; data: Announcement[] }
            | { type: "honors"; data: Honor[] }
            | { type: "calendar"; data: Record<string, CalendarEvent[]> };
        const promises: Promise<DataResult>[] = [];

        // 載入所有資料以供搜尋使用
        promises.push(
            fetch("/data/announcements.json")
                .then((res) => res.json())
                .then((data): DataResult => ({ type: "announcements", data }))
                .catch(() => ({ type: "announcements", data: [] }))
        );

        promises.push(
            fetch("/data/honors.json")
                .then((res) => res.json())
                .then((data): DataResult => ({ type: "honors", data }))
                .catch(() => ({ type: "honors", data: [] }))
        );

        promises.push(
            fetch("/data/calendar.json")
                .then((res) => res.json())
                .then((data): DataResult => ({ type: "calendar", data }))
                .catch(() => ({ type: "calendar", data: {} }))
        );

        Promise.all(promises).then((results) => {
            results.forEach((result) => {
                if (result.type === "announcements") {
                    setAnnouncements(result.data);
                } else if (result.type === "honors") {
                    setHonors(result.data);
                } else if (result.type === "calendar") {
                    const calendarData = result.data;
                    const allEvents: CalendarEvent[] = [];
                    Object.values(calendarData).forEach((monthEvents) => {
                        allEvents.push(...(monthEvents as CalendarEvent[]));
                    });
                    setCalendarEvents(allEvents);
                }
            });
        });
    }, []);

    // 根據查詢關鍵字過濾數據
    const filteredAnnouncements = announcements.filter((a) =>
        a.title.toLowerCase().includes(query.toLowerCase())
    );

    const filteredHonors = honors.filter((h) =>
        h.title.toLowerCase().includes(query.toLowerCase())
    );

    const filteredEvents = calendarEvents.filter((e) =>
        e.title.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="space-y-6 text-foreground">
            {/* 頁面標題列 */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Search className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold">搜尋</h2>
            </div>

            {/* 搜尋輸入框 */}
            <div className="px-1">
                <Input
                    placeholder="輸入關鍵字搜尋..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-background border-border"
                />
            </div>

            <div className="space-y-6">
                {query && (
                    <>
                        {/* 行政公告搜尋結果 */}
                        {filteredAnnouncements.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                                    行政公告 ({filteredAnnouncements.length})
                                </h3>
                                <div className="space-y-2">
                                    {filteredAnnouncements.map((item, idx) => (
                                        <a
                                            key={idx}
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary hover:bg-primary/5 transition-all"
                                        >
                                            <ExternalLink className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium">
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

                        {/* 榮譽榜搜尋結果 */}
                        {filteredHonors.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                                    榮譽榜 ({filteredHonors.length})
                                </h3>
                                <div className="space-y-2">
                                    {filteredHonors.map((item, idx) => (
                                        <a
                                            key={idx}
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary hover:bg-primary/5 transition-all"
                                        >
                                            <ExternalLink className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium">
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

                        {/* 行事曆搜尋結果 */}
                        {filteredEvents.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                                    行事曆事件 ({filteredEvents.length})
                                </h3>
                                <div className="space-y-2">
                                    {filteredEvents.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card"
                                        >
                                            <CalendarIcon className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium">
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

                        {/* 無匹配結果提示 */}
                        {filteredAnnouncements.length === 0 && filteredHonors.length === 0 && filteredEvents.length === 0 && (
                            <div className="text-center text-muted-foreground py-8 border border-dashed border-border rounded-lg">
                                找不到相關結果
                            </div>
                        )}
                    </>
                )}

                {/* 初始搜尋提示 */}
                {!query && (
                    <div className="text-center text-muted-foreground py-8 border border-dashed border-border rounded-lg">
                        請輸入關鍵字開始搜尋
                    </div>
                )}
            </div>
        </div>
    );
}
