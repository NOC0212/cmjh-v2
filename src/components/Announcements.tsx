import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFavorites } from "@/hooks/useFavorites";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Megaphone,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AttachmentLink {
  name: string;
  link: string;
}

interface RawAnnouncement {
  date: string;
  title: string;
  url: string;
  content?: string;
  links?: AttachmentLink[];
  attachments?: AttachmentLink[];
  category?: string;
  source?: string;
}

interface Announcement {
  id: string;
  date: string;
  title: string;
  url: string;
  content: string;
  attachments: AttachmentLink[];
  category: string;
  source: string;
}

const ITEMS_PER_PAGE = 8;

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

function normalizeAnnouncement(item: RawAnnouncement): Announcement {
  const attachments = item.attachments ?? item.links ?? [];
  const category = item.category?.trim() || "公告";
  const source = item.source?.trim() || "行政處室";

  return {
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
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState<"left" | "right">("right");

  const { addFavorite, removeFavorite, isFavorite, cleanupFavorites } = useFavorites();

  useEffect(() => {
    setExpandedId(null);
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    setExpandedId(null);
  }, [selectedCategory]);

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const singleFile = await fetch("/data/announcements.json");
        if (singleFile.ok) {
          const raw = (await singleFile.json()) as RawAnnouncement[];
          const normalized = raw.map(normalizeAnnouncement);
          setAnnouncements(normalized);
          cleanupFavorites("announcement", normalized.map((item) => item.id));
          return;
        }

        const files = ["/data/announcements-p1.json", "/data/announcements-p2.json", "/data/announcements-p3.json"];
        const oldData = await Promise.all(files.map((file) => fetch(file).then((res) => res.json())));
        const normalized = oldData.flat().map((item: RawAnnouncement) => normalizeAnnouncement(item));
        setAnnouncements(normalized);
        cleanupFavorites("announcement", normalized.map((item) => item.id));
      } catch (error) {
        console.error("Failed to load announcements:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAnnouncements();
  }, [cleanupFavorites]);

  const categories = useMemo(() => {
    const set = new Set(announcements.map((item) => item.category).filter(Boolean));
    return ["全部", ...Array.from(set)];
  }, [announcements]);

  const filteredAnnouncements = useMemo(() => {
    if (selectedCategory === "全部") return announcements;
    return announcements.filter((item) => item.category === selectedCategory);
  }, [announcements, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredAnnouncements.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentAnnouncements = filteredAnnouncements.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const pageMeta = useMemo(() => `${currentPage} / ${totalPages}`, [currentPage, totalPages]);

  const goPrev = () => {
    setDirection("left");
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goNext = () => {
    setDirection("right");
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  if (loading) {
    return (
      <section id="announcements" className="mb-12 scroll-mt-20">
        <div className="mb-6 h-10 w-56 animate-pulse rounded-lg bg-primary/20" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-6 w-20 shrink-0" />
                <Skeleton className="h-6 flex-1" />
                <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="announcements" className="mb-12 scroll-mt-20">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="flex items-center gap-3 bg-gradient-to-r from-primary to-sky-500 bg-clip-text text-3xl font-bold text-transparent">
          <Megaphone className="h-8 w-8 text-primary" />
          行政公告
        </h2>

        <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-2 py-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={goPrev} disabled={currentPage === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[110px] text-center text-xs text-muted-foreground">第 {pageMeta} 頁</span>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={goNext} disabled={currentPage === totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {categories.map((category) => {
          const isActive = selectedCategory === category;
          const isAll = category === "全部";
          return (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold transition-all",
                isAll ? "border-primary/25 bg-primary/10 text-primary" : tagColorClass(category),
                isActive ? "scale-[1.02] ring-2 ring-primary/30 shadow-sm" : "opacity-80 hover:opacity-100"
              )}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div key={currentPage} className={cn("space-y-3", direction === "right" ? "animate-slide-in-right" : "animate-slide-in-left")}>
        {currentAnnouncements.map((announcement) => {
          const isExpanded = expandedId === announcement.id;
          const favoriteId = announcement.id;
          const favorited = isFavorite(favoriteId);

          return (
            <article
              key={announcement.id}
              className="overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-card to-card/90 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
            >
              <button
                className={cn("w-full px-4 py-4 text-left transition-colors", isExpanded ? "bg-primary/5" : "hover:bg-primary/5")}
                onClick={() => setExpandedId(isExpanded ? null : announcement.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg border border-primary/20 bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                    {announcement.date}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-semibold", tagColorClass(announcement.category))}>
                        {announcement.category}
                      </span>
                      <span className="text-[11px] text-muted-foreground">來源：{announcement.source}</span>
                    </div>
                    <h3 className="line-clamp-2 text-sm font-semibold text-foreground">{announcement.title}</h3>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (favorited) {
                          removeFavorite(favoriteId);
                        } else {
                            addFavorite({
                              id: favoriteId,
                              type: "announcement",
                              title: announcement.title,
                              date: announcement.date,
                              url: announcement.url,
                              content: announcement.content,
                              category: announcement.category,
                              source: announcement.source,
                              links: announcement.attachments,
                            });
                        }
                      }}
                    >
                      <Star className={cn("h-4 w-4", favorited ? "fill-primary text-primary" : "text-muted-foreground")} />
                    </Button>

                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border/60 px-4 pb-4 pt-3">
                  {announcement.content && (
                    <p className="whitespace-pre-wrap rounded-xl border border-border/70 bg-muted/30 p-3 text-sm leading-relaxed text-foreground/90">
                      {announcement.content}
                    </p>
                  )}

                  {announcement.attachments.length > 0 && (
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {announcement.attachments.map((file, index) => (
                        <a
                          key={`${file.link}-${index}`}
                          href={file.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/file flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 transition-all hover:bg-primary hover:text-primary-foreground"
                        >
                          <div className="rounded-md bg-primary/10 p-1.5 transition-colors group-hover/file:bg-white/20">
                            <FileText className="h-4 w-4" />
                          </div>
                          <span className="truncate text-sm">{file.name}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex justify-end">
                    <a
                      href={announcement.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      查看原始公告
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {filteredAnnouncements.length === 0 && (
        <div className="mt-4 rounded-2xl border border-dashed border-border bg-muted/20 py-10 text-center text-sm text-muted-foreground">
          <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Calendar className="h-4 w-4" />
          </div>
          目前沒有符合此標籤的公告
        </div>
      )}
    </section>
  );
}
