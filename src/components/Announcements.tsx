import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
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

  useEffect(() => { setExpandedId(null); }, [currentPage]);
  useEffect(() => { setCurrentPage(1); setExpandedId(null); }, [selectedCategory]);

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
        const oldData = await Promise.all(files.map((file) => fetch(file).then((res) => { if (!res.ok) throw new Error("Failed to fetch " + file); return res.json(); })));
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

  const goPrev = () => { setDirection("left"); setCurrentPage((prev) => Math.max(1, prev - 1)); };
  const goNext = () => { setDirection("right"); setCurrentPage((prev) => Math.min(totalPages, prev + 1)); };

  if (loading) {
    return (
      <section id="announcements">
        <div className="mb-6 h-8 w-48 rounded-lg bg-muted animate-pulse" />
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
    <section id="announcements">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="section-header-icon">
            <Megaphone className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-bold text-foreground">行政公告</h2>
        </div>

        <div className="flex items-center gap-1.5 bg-muted/50 border border-border/40 rounded-xl p-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={goPrev} disabled={currentPage === 1}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="min-w-[90px] text-center text-[11px] text-muted-foreground font-medium">
            {currentPage} / {totalPages}
          </span>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={goNext} disabled={currentPage === totalPages}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        {categories.map((category) => {
          const isActive = selectedCategory === category;
          const isAll = category === "全部";
          return (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all",
                isAll ? "border-primary/20 bg-primary/10 text-primary" : tagColorClass(category),
                isActive ? "ring-2 ring-primary/20 shadow-sm" : "opacity-75 hover:opacity-100"
              )}
            >
              {category}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, x: direction === "right" ? 16 : -16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction === "right" ? -16 : 16 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-2"
        >
        {currentAnnouncements.map((announcement) => {
          const isExpanded = expandedId === announcement.id;
          const favoriteId = announcement.id;
          const favorited = isFavorite(favoriteId);

          return (
            <article
              key={announcement.id}
              className={cn(
                "overflow-hidden rounded-xl border transition-all duration-200",
                isExpanded
                  ? "border-primary/20 bg-primary/[0.02] shadow-sm"
                  : "border-border/60 bg-card hover:border-border hover:shadow-sm"
              )}
            >
              <div
                role="button"
                tabIndex={0}
                className={cn(
                  "w-full px-4 py-3 text-left transition-colors cursor-pointer",
                  isExpanded && "bg-primary/[0.02]"
                )}
                onClick={() => setExpandedId(isExpanded ? null : announcement.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpandedId(isExpanded ? null : announcement.id); } }}
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg border border-primary/15 bg-primary/8 px-2 py-1 text-[11px] font-semibold text-primary shrink-0 mt-0.5 leading-none">
                    {announcement.date}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-semibold leading-none", tagColorClass(announcement.category))}>
                        {announcement.category}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{announcement.source}</span>
                    </div>
                    <h3 className="line-clamp-2 text-sm font-medium text-foreground leading-snug">{announcement.title}</h3>
                  </div>

                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation();
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
                    <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform duration-200", isExpanded && "rotate-180")} />
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-border/40 px-4 pb-4 pt-3 space-y-3">
                  {announcement.content && (
                    <p className="rounded-xl border border-border/50 bg-muted/30 p-3 text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                      {announcement.content}
                    </p>
                  )}

                  {announcement.attachments.length > 0 && (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {announcement.attachments.map((file, index) => (
                        <a
                          key={`${file.link}-${index}`}
                          href={file.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-xl border border-primary/15 bg-primary/5 px-3 py-2 text-foreground transition-all hover:bg-primary hover:text-primary-foreground group"
                        >
                          <div className="rounded-lg bg-primary/10 p-1.5 text-primary transition-colors group-hover:bg-white/20 group-hover:text-primary-foreground">
                            <FileText className="h-3.5 w-3.5" />
                          </div>
                          <span className="truncate text-xs font-medium group-hover:text-primary-foreground">{file.name}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end pt-0.5">
                    <a
                      href={announcement.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                    >
                      查看原始公告
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
            </article>
          );
        })}
        </motion.div>
      </AnimatePresence>

      {filteredAnnouncements.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 py-10 text-center">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
            <Calendar className="h-4 w-4" />
          </div>
          <p className="text-sm text-muted-foreground">目前沒有符合此標籤的公告</p>
        </div>
      )}
    </section>
  );
}
