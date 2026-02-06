import { useState, useEffect } from "react";
import { Search, ExternalLink, Calendar as CalendarIcon, ChevronRight, ChevronLeft, Star, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";

interface Announcement {
    date: string;
    title: string;
    url: string;
    content: string;
    links: { name: string; link: string }[];
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
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const { addFavorite, removeFavorite, isFavorite } = useFavorites();

    // 初始化載入公告、榮譽榜與行事曆數據（無論組件是否啟用）
    useEffect(() => {
        type DataResult =
            | { type: "announcements"; data: Announcement[] }
            | { type: "honors"; data: Honor[] }
            | { type: "calendar"; data: Record<string, CalendarEvent[]> };
        const promises: Promise<DataResult>[] = [];

        // 載入所有資料以供搜尋使用
        // 行政公告 (分 3 頁讀取)
        const announcementPromises = ["p1", "p2", "p3"].map(p => 
            fetch(`/data/announcements-${p}.json`)
                .then((res) => res.json())
                .catch(() => [])
        );

        promises.push(
            Promise.all(announcementPromises)
                .then((allPagesData): DataResult => ({ 
                    type: "announcements", 
                    data: allPagesData.flat() 
                }))
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
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setExpandedIndex(null);
                    }}
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
                                <div className="space-y-3">
                                    {filteredAnnouncements.map((item, idx) => {
                                        const favoriteId = `announcement-${item.date}-${item.title}`;
                                        const isFav = isFavorite(favoriteId);
                                        const isExpanded = expandedIndex === idx;

                                        return (
                                            <div
                                                key={idx}
                                                className="group bg-card rounded-2xl border border-border hover:border-primary transition-all duration-300 hover:shadow-lg overflow-hidden"
                                            >
                                                <div 
                                                    className={`p-4 cursor-pointer transition-colors ${isExpanded ? 'bg-primary/5' : 'hover:bg-primary/5'}`}
                                                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <span className="text-xs text-primary-foreground font-medium bg-primary px-2 py-1 rounded flex-shrink-0">
                                                            {item.date}
                                                        </span>
                                                        <div className="flex-1 text-card-foreground group-hover:text-primary transition-colors font-medium text-sm">
                                                            {item.title}
                                                        </div>
                                                        <div className="flex items-center gap-1 flex-shrink-0">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (isFav) {
                                                                        removeFavorite(favoriteId);
                                                                    } else {
                                                                        addFavorite({
                                                                            id: favoriteId,
                                                                            type: "announcement",
                                                                            title: item.title,
                                                                            date: item.date,
                                                                            url: item.url,
                                                                            content: item.content,
                                                                            links: item.links,
                                                                        });
                                                                    }
                                                                }}
                                                            >
                                                                <Star
                                                                    className={`h-4 w-4 transition-colors ${isFav ? "fill-primary text-primary" : "text-muted-foreground"}`}
                                                                />
                                                            </Button>
                                                            <div className="text-muted-foreground transition-transform duration-300">
                                                                {isExpanded ? <ChevronLeft className="h-4 w-4 -rotate-90" /> : <ChevronRight className="h-4 w-4" />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {isExpanded && (
                                                    <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-1 duration-300">
                                                        <div className="h-px bg-border mb-4" />
                                                        <div className="space-y-4">
                                                            <div className="text-sm text-card-foreground/80 leading-relaxed whitespace-pre-wrap">
                                                                {item.content}
                                                            </div>
                                                            
                                                            {item.links && item.links.length > 0 && (
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                                                                    {item.links.map((link, lIdx) => (
                                                                        <a
                                                                            key={lIdx}
                                                                            href={link.link}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10 text-card-foreground group/link hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all duration-300 shadow-sm hover:shadow-md"
                                                                        >
                                                                            <div className="p-2 bg-primary/10 rounded-lg group-hover/link:bg-white/20 transition-colors">
                                                                                <FileText className="h-4 w-4 text-primary group-hover/link:text-primary-foreground" />
                                                                            </div>
                                                                            <span className="text-sm font-medium truncate flex-1">
                                                                                {link.name}
                                                                            </span>
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            <div className="pt-4 flex justify-end">
                                                                <a
                                                                    href={item.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs text-primary hover:underline flex items-center gap-1"
                                                                >
                                                                    查看原始公告
                                                                    <ExternalLink className="h-3 w-3" />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
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
