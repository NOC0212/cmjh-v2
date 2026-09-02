import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ExternalLink,
  FileText,
  Globe,
  Search,
  Shield,
  Star,
} from "lucide-react";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useFavorites } from "@/hooks/use-favorites";
import { useAnnouncements, useHonors, useSchoolCalendar } from "@/hooks/use-static-data";
import { useCommonSites } from "@/hooks/use-common-sites";
import { isAdminUnlocked, unlockAdmin } from "@/lib/app-version";
import { useToast } from "@/components/ui/toast";
import type {
  Announcement as AnnouncementData,
  CalendarEvent,
  HonorItem,
} from "@/lib/data";
import { cn } from "@/lib/utils";

/** 搜尋用公告 */
type SearchableAnnouncement = AnnouncementData & { id: string };

function normalizeAnnouncement(item: AnnouncementData): SearchableAnnouncement {
  return {
    ...item,
    id: `announcement-${item.date}-${item.title}`,
    content: item.content ?? "",
    attachments: item.attachments ?? [],
    category: item.category?.trim() || "公告",
    source: item.source?.trim() || "行政處室",
  };
}

/** 去除 HTML 標籤 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  // 統一資料層：公告 / 榮譽榜 / 行事曆（@/hooks/use-static-data）
  const { data: rawAnnouncements = [], isLoading: announcementsLoading } = useAnnouncements();
  const { data: honors = [], isLoading: honorsLoading } = useHonors();
  const { data: calendar, isLoading: calendarLoading } = useSchoolCalendar();
  // 常用網站（localStorage，含預設網站）
  const { sites, getCategoryLabel } = useCommonSites();

  const announcements = useMemo(
    () => rawAnnouncements.map(normalizeAnnouncement),
    [rawAnnouncements],
  );

  // 行事曆為月份分組結構，攤平成事件清單供搜尋
  const calendarEvents = useMemo<CalendarEvent[]>(
    () => (calendar ? Object.values(calendar).flat() : []),
    [calendar],
  );

  const lowerQuery = query.toLowerCase();

  // 搜尋「admin」→ 顯示管理後台入口（點擊解鎖並跳轉）
  const isAdminQuery = lowerQuery.trim() === "admin";

  const handleAdminEnter = () => {
    if (!isAdminUnlocked()) {
      unlockAdmin();
      toast({ title: "🔓 管理後台已解鎖", description: "已開啟管理員入口" });
    }
    navigate("/admin");
  };

  // 根據查詢關鍵字過濾數據（公告支援標題＋內文全文搜尋）
  const filteredAnnouncements = useMemo(
    () =>
      announcements.filter(
        (a) =>
          a.title.toLowerCase().includes(lowerQuery) ||
          stripHtml(a.content ?? "").toLowerCase().includes(lowerQuery),
      ),
    [announcements, lowerQuery],
  );

  const filteredHonors = useMemo(
    () => honors.filter((h: HonorItem) => h.title.toLowerCase().includes(lowerQuery)),
    [honors, lowerQuery],
  );

  const filteredEvents = useMemo(
    () => calendarEvents.filter((e) => e.title.toLowerCase().includes(lowerQuery)),
    [calendarEvents, lowerQuery],
  );

  const filteredSites = useMemo(
    () => sites.filter((s) => s.name.toLowerCase().includes(lowerQuery)),
    [sites, lowerQuery],
  );

  const isDataLoading = announcementsLoading || honorsLoading || calendarLoading;
  const noResults = !isAdminQuery &&
    filteredAnnouncements.length === 0 &&
    filteredHonors.length === 0 &&
    filteredEvents.length === 0 &&
    filteredSites.length === 0;

  return (
    <div className="space-y-6 text-foreground opacity-0 animate-fade-in">
      {/* 頁面標題列 */}
      <div className="flex items-center gap-3">
        <span className="section-icon">
          <Search className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-bold text-foreground">搜尋</h2>
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
        {query && isDataLoading && (
          <div className="space-y-3" aria-busy="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-5 w-20 shrink-0 rounded-md" />
                  <Skeleton className="h-5 flex-1 rounded-md" />
                  <Skeleton className="h-5 w-5 shrink-0 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        )}

        {query && !isDataLoading && (
          <>
            {/* 搜尋「admin」→ 管理後台入口 */}
            {isAdminQuery && (
              <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center space-y-4">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">管理後台</h3>
                  <p className="text-sm text-muted-foreground mt-1">系統設定、校園資料管理與版本控制</p>
                </div>
                <Button
                  size="lg"
                  className="h-12 px-8 rounded-2xl font-bold gap-2"
                  onClick={handleAdminEnter}
                >
                  <Shield className="h-4 w-4" />
                  {isAdminUnlocked() ? "進入管理後台" : "解鎖並進入管理後台"}
                </Button>
              </div>
            )}

            {/* 行政公告搜尋結果 */}
            {filteredAnnouncements.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  行政公告 ({filteredAnnouncements.length})
                </h3>
                <div className="space-y-3">
                  {filteredAnnouncements.map((item, idx) => {
                    const favoriteId = item.id;
                    const isFav = isFavorite(favoriteId);
                    const isExpanded = expandedIndex === idx;

                    return (
                      <div
                        key={favoriteId}
                        className="group bg-card rounded-2xl border border-border hover:border-primary transition-all duration-300 hover:shadow-lg"
                      >
                        <div
                          className={cn(
                            "p-4 cursor-pointer transition-colors",
                            isExpanded ? "bg-primary/5" : "hover:bg-primary/5",
                          )}
                          onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                        >
                          <div className="flex items-start gap-3">
                            <span className="rounded-lg border border-primary/15 bg-primary/10 px-2 py-1 text-[11px] font-semibold leading-none text-primary shrink-0">
                              {item.date}
                            </span>
                            <div className="flex-1 text-card-foreground group-hover:text-primary transition-colors font-medium text-sm">
                              {item.title}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                aria-label={isFav ? "取消收藏" : "加入收藏"}
                                aria-pressed={isFav}
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
                                      category: item.category,
                                      source: item.source,
                                      links: item.attachments,
                                    });
                                  }
                                }}
                              >
                                <Star
                                  className={cn(
                                    "h-4 w-4 transition-colors",
                                    isFav ? "fill-primary text-primary" : "text-muted-foreground",
                                  )}
                                />
                              </Button>
                              <div className="text-muted-foreground transition-transform duration-300">
                                <ChevronDown
                                  className={cn(
                                    "h-4 w-4 transition-transform duration-200",
                                    isExpanded && "rotate-180",
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-1 duration-300">
                            <div className="h-px bg-border mb-4" />
                            <div className="space-y-4">
                              {item.content && (
                                <div
                                  className="text-sm text-card-foreground/80 leading-relaxed [&_table]:w-full [&_table]:table-fixed [&_table]:border-collapse [&_table]:text-xs [&_td]:border [&_td]:border-border/60 [&_td]:p-2 [&_td]:break-words [&_th]:border [&_th]:border-border/60 [&_th]:bg-muted/50 [&_th]:p-2 [&_th]:break-words [&_th]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:hover:no-underline [&_img]:max-w-full [&_img]:rounded-lg [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1"
                                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.content) }}
                                />
                              )}

                              {item.attachments && item.attachments.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                                  {item.attachments.map((link, lIdx) => (
                                    <a
                                      key={`${link.link}-${lIdx}`}
                                      href={link.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="group/link flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10 text-card-foreground hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all duration-300 shadow-sm hover:shadow-md"
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
                  {filteredHonors.map((item) => (
                    <a
                      key={`honor-${item.date}-${item.title}`}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <ExternalLink className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{item.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">{item.date}</div>
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
                      key={`event-${item.date}-${item.title}-${idx}`}
                      className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card"
                    >
                      <CalendarIcon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{item.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">{item.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 常用網站搜尋結果 */}
            {filteredSites.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  常用網站 ({filteredSites.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredSites.map((site) => (
                    <a
                      key={site.id}
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/site flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                        <Globe className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{site.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {getCategoryLabel(site.category)}
                        </div>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/50 group-hover/site:text-primary transition-colors shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* 無匹配結果提示 */}
            {noResults && (
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
