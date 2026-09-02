import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useFavorites } from "@/hooks/use-favorites";
import { useAnnouncements } from "@/hooks/use-static-data";
import type { Announcement as AnnouncementData } from "@/lib/data";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileText,
  Megaphone,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";

// 學校公告類別標籤配色（依類別名稱 hash 分配 8 色）
const TAG_COLOR_CLASSES = [
  "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-200 dark:border-rose-800",
  "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-800",
  "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800",
  "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-800",
  "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-200 dark:border-cyan-800",
  "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800",
  "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-200 dark:border-violet-800",
  "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-900/30 dark:text-fuchsia-200 dark:border-fuchsia-800",
];

function hashTag(text: string) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function tagColorClass(tag: string) {
  return TAG_COLOR_CLASSES[hashTag(tag) % TAG_COLOR_CLASSES.length];
}

/** 首頁區塊：精華公告 */
const HOME_LIMIT = 5;

type AnnouncementItem = AnnouncementData & { id: string };

function normalizeAnnouncement(item: AnnouncementData): AnnouncementItem {
  const attachments = item.attachments ?? [];
  const category = item.category?.trim() || "公告";
  const source = item.source?.trim() || "行政處室";
  return {
    ...item,
    // 與舊版相同的收藏 id 規則，確保收藏紀錄延續
    id: `announcement-${item.date}-${item.title}`,
    date: item.date,
    title: item.title,
    url: item.url,
    content: item.content ?? "",
    attachments,
    category,
    source,
  };
}

export function Announcements() {
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const { addFavorite, removeFavorite, isFavorite, cleanupFavorites } = useFavorites();

  // 使用 useAnnouncements（@/hooks/use-static-data）統一管理資料擷取與背景更新
  const { data: rawAnnouncements, isLoading: loading } = useAnnouncements();

  const announcements = useMemo(() => {
    if (!rawAnnouncements) return [];
    const normalized = rawAnnouncements.map(normalizeAnnouncement);
    // 清理收藏中已不存在的公告
    cleanupFavorites("announcement", normalized.map((item) => item.id));
    return normalized;
  }, [rawAnnouncements, cleanupFavorites]);

  // 首頁精華：只取最新 5 則
  const visibleAnnouncements = useMemo(
    () => announcements.slice(0, HOME_LIMIT),
    [announcements],
  );

  const categories = useMemo(() => {
    const set = new Set(visibleAnnouncements.map((item) => item.category).filter(Boolean));
    return ["全部", ...Array.from(set)];
  }, [visibleAnnouncements]);

  const filteredAnnouncements = useMemo(() => {
    if (selectedCategory === "全部") return visibleAnnouncements;
    return visibleAnnouncements.filter((item) => item.category === selectedCategory);
  }, [visibleAnnouncements, selectedCategory]);

  // 切換分類時收合所有展開項目
  useEffect(() => { setExpanded({}); }, [selectedCategory]);

  if (loading) {
    return (
      <section aria-label="行政公告" aria-busy="true">
        <div className="mb-5 flex items-center gap-3">
          <span className="section-icon" aria-hidden="true">
            <Megaphone className="h-4 w-4" />
          </span>
          <h2 className="sr-only">行政公告</h2>
          <div className="h-7 w-32 rounded-lg bg-muted animate-pulse" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-5 w-16 shrink-0 rounded-md" />
                <Skeleton className="h-5 flex-1 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section aria-label="行政公告">
      {/* 區塊標題（統一模式） */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="section-icon">
            <Megaphone className="h-4 w-4" />
          </span>
          <h2 className="text-lg font-bold text-foreground">行政公告</h2>
        </div>

        <Link
          to="/announcements"
          className="inline-flex items-center gap-0.5 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          查看全部
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* 分類標籤篩選 */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5 rounded-xl border border-border/40 bg-muted/50 p-1">
        {categories.map((category) => {
          const isActive = selectedCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              aria-pressed={isActive}
              className={cn(
                "rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors",
                isActive
                  ? "border-primary/20 bg-primary/10 text-primary shadow-sm"
                  : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {category}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-2"
        >
          {filteredAnnouncements.map((announcement) => {
            const favoriteId = announcement.id;
            const favorited = isFavorite(favoriteId);
            const isOpen = !!expanded[announcement.id];

            return (
              <Collapsible
                key={announcement.id}
                open={isOpen}
                onOpenChange={(open) => setExpanded((prev) => ({ ...prev, [announcement.id]: open }))}
              >
                <article className="overflow-hidden rounded-xl border border-border/60 bg-card transition-all duration-200 hover:border-border hover:shadow-sm">
                  <div className="flex items-start gap-3 px-4 py-3">
                    <CollapsibleTrigger className="flex min-w-0 flex-1 items-start gap-3 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <div className="mt-0.5 shrink-0 rounded-lg border border-primary/15 bg-primary/10 px-2 py-1 text-[11px] font-semibold leading-none text-primary">
                        {announcement.date}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-1.5">
                          <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-semibold leading-none", tagColorClass(announcement.category))}>
                            {announcement.category}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{announcement.source}</span>
                        </div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground">{announcement.title}</h3>
                          <ChevronDown
                            className={cn(
                              "mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
                              isOpen && "rotate-180",
                            )}
                          />
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 rounded-lg"
                      aria-label={favorited ? "取消收藏" : "加入收藏"}
                      aria-pressed={favorited}
                      onClick={() => {
                        if (favorited) { removeFavorite(favoriteId); }
                        else {
                          addFavorite({
                            id: favoriteId, type: "announcement", title: announcement.title,
                            date: announcement.date, url: announcement.url, content: announcement.content,
                            category: announcement.category, source: announcement.source,
                            links: announcement.attachments,
                          });
                        }
                      }}
                    >
                      <Star className={cn("h-3.5 w-3.5", favorited ? "fill-primary text-primary" : "text-muted-foreground")} />
                    </Button>
                  </div>

                  <CollapsibleContent>
                    <div className="border-t border-border/40 bg-muted/20 px-4 py-3 text-sm leading-relaxed text-foreground/90">
                      {announcement.content ? (
                        <div
                          className="max-h-72 overflow-y-auto overflow-x-auto pr-2 min-w-0 [&_table]:w-full [&_table]:table-fixed [&_table]:border-collapse [&_table]:text-xs [&_td]:border [&_td]:border-border/60 [&_td]:p-2 [&_td]:break-words [&_th]:border [&_th]:border-border/60 [&_th]:bg-muted/50 [&_th]:p-2 [&_th]:break-words [&_th]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:hover:no-underline [&_img]:max-w-full [&_img]:rounded-lg [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1"
                          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(announcement.content) }}
                        />
                      ) : (
                        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center text-muted-foreground">
                          <Megaphone className="mx-auto mb-3 h-8 w-8 opacity-20" />
                          <p>這則公告沒有附加詳細內容。</p>
                        </div>
                      )}

                      {announcement.attachments && announcement.attachments.length > 0 && (
                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {announcement.attachments.map((file, index) => (
                            <a
                              key={`${file.link}-${index}`}
                              href={file.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center gap-2 rounded-xl border border-primary/15 bg-primary/5 px-3 py-2 text-foreground transition-colors hover:bg-primary/10"
                            >
                              <span className="rounded-lg bg-primary/10 p-1.5 text-primary">
                                <FileText className="h-3.5 w-3.5" />
                              </span>
                              <span className="truncate text-xs font-medium">{file.name}</span>
                            </a>
                          ))}
                        </div>
                      )}

                      {announcement.url && (
                        <div className="mt-3 flex justify-end">
                          <a
                            href={announcement.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                          >
                            查看原始公告
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </article>
              </Collapsible>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {filteredAnnouncements.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 py-10 text-center">
          <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Calendar className="h-4 w-4" />
          </div>
          <p className="text-sm text-muted-foreground">目前沒有符合此標籤的公告</p>
        </div>
      )}
    </section>
  );
}
