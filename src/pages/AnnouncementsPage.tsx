import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Megaphone,
  Star,
  Pin,
  Bell,
  Zap,
  Info,
  Wrench,
} from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import { useAnnouncements } from "@/hooks/use-static-data";
import { useSiteAnnouncements } from "@/hooks/use-site-announcements";
import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

// ─── 學校公告 ──────────────────────────────────────────────────────────────────

interface Attachment {
  name: string;
  link: string;
}

interface RawAnnouncement {
  date: string;
  title: string;
  url: string;
  content?: string;
  links?: Attachment[];
  attachments?: Attachment[];
  category?: string;
  source?: string;
}

interface NormalizedAnnouncement {
  id: string;
  date: string;
  title: string;
  url: string;
  content: string;
  attachments: Attachment[];
  category: string;
  source: string;
}

const ITEMS_PER_PAGE = 8;

// 學校公告類別標籤配色（依類別名稱 hash 分配 8 色，與原版一致）
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

function normalize(item: RawAnnouncement): NormalizedAnnouncement {
  const attachments = item.attachments ?? item.links ?? [];
  return {
    id: `announcement-${item.date}-${item.title}`,
    date: item.date,
    title: item.title,
    url: item.url,
    content: item.content ?? "",
    attachments,
    category: item.category?.trim() || "公告",
    source: item.source?.trim() || "行政處室",
  };
}

function SchoolAnnouncements() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<NormalizedAnnouncement | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [direction, setDirection] = useState<"left" | "right">("right");

  const { addFavorite, removeFavorite, isFavorite, cleanupFavorites } = useFavorites();
  const { data: raw, isLoading } = useAnnouncements();

  const announcements = useMemo(() => {
    if (!raw) return [];
    const normalized = raw.map(normalize);
    cleanupFavorites("announcement", normalized.map((a) => a.id));
    return normalized;
  }, [raw, cleanupFavorites]);

  const categories = useMemo(() => {
    const set = new Set<string>(["全部"]);
    announcements.forEach((a) => set.add(a.category));
    return [...set];
  }, [announcements]);

  const filtered = useMemo(() => {
    if (selectedCategory === "全部") return announcements;
    return announcements.filter((a) => a.category === selectedCategory);
  }, [announcements, selectedCategory]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    setDirection(page > currentPage ? "right" : "left");
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  return (
    <div className="space-y-6">
      {/* 分類篩選 */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
              selectedCategory === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground",
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : paged.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 py-10 text-center">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
            <Calendar className="h-4 w-4" />
          </div>
          <p className="text-sm text-muted-foreground">目前沒有符合此標籤的公告</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage + selectedCategory}
            initial={{ opacity: 0, x: direction === "right" ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction === "right" ? -20 : 20 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {paged.map((ann) => {
              const isFav = isFavorite(ann.id);

              return (
                <div
                  key={ann.id}
                  className="group rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md p-4 md:p-5 cursor-pointer"
                  onClick={() => setSelected(ann)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn("inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold leading-none", tagColorClass(ann.category))}>
                          {ann.category}
                        </span>
                        <span className="text-[11px] text-muted-foreground shrink-0">{ann.date}</span>
                      </div>
                      <h3 className="text-sm font-semibold leading-snug line-clamp-2">{ann.title}</h3>
                      <p className="text-xs text-muted-foreground/70 mt-1.5 line-clamp-2">{ann.source}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        isFav ? removeFavorite(ann.id) : addFavorite({
                          id: ann.id,
                          type: "announcement",
                          title: ann.title,
                          date: ann.date,
                          url: ann.url,
                          content: ann.content,
                          category: ann.category,
                          source: ann.source,
                          links: ann.attachments,
                        });
                      }}
                      className={cn(
                        "shrink-0 p-1.5 rounded-lg transition-colors",
                        isFav ? "text-warning" : "text-muted-foreground opacity-0 group-hover:opacity-100",
                      )}
                    >
                      <Star className={cn("h-4 w-4", isFav && "fill-current")} />
                    </button>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}

      {/* 分頁 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="ghost"
            size="icon"
            disabled={currentPage <= 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8 text-xs"
              onClick={() => goToPage(page)}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="icon"
            disabled={currentPage >= totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* 公告詳情 Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="w-[92vw] max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl">
          <DialogTitle className="sr-only">公告詳情</DialogTitle>
          {selected && (
            <div className="space-y-4">
              <div className="min-w-0">
                <span className={cn("inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold leading-none mb-2", tagColorClass(selected.category))}>{selected.category}</span>
                <h3 className="text-lg font-bold leading-tight">{selected.title}</h3>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {selected.date}
                  <span className="ml-2">{selected.source}</span>
                </div>
              </div>

              {selected.content && (
                <div className="rounded-xl bg-muted/30 p-4 text-sm leading-relaxed announcement-content"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selected.content, { ALLOWED_TAGS: ["p", "br", "strong", "em", "a", "ul", "ol", "li", "span", "div", "img", "table", "tr", "td", "th", "thead", "tbody", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "blockquote", "pre", "code"], ALLOWED_ATTR: ["href", "target", "src", "alt", "class", "style", "width", "height"] }) }}
                />
              )}

              {selected.attachments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">附件</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.attachments.map((att, i) => (
                      <a
                        key={i}
                        href={att.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        {att.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <a
                  href={selected.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                >
                  查看原始公告
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── 站內公告 ──────────────────────────────────────────────────────────────────

function SiteAnnouncements() {
  const { announcements: raw, isLoading } = useSiteAnnouncements();
  const [selectedItem, setSelectedItem] = useState<typeof raw[number] | null>(null);

  const announcements = useMemo(() => {
    return [...raw].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [raw]);

  const isNew = (dateStr: string) => {
    const diff = Math.abs(new Date().getTime() - new Date(dateStr).getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) <= 7;
  };

  const getTypeConfig = (type?: string) => {
    switch (type) {
      case "update": return { label: "更新", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: <Zap className="w-3 h-3" /> };
      case "alert": return { label: "重要", color: "bg-red-500/10 text-red-500 border-red-500/20", icon: <Bell className="w-3 h-3" /> };
      case "maintenance": return { label: "維護", color: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: <Wrench className="w-3 h-3" /> };
      default: return { label: "資訊", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: <Info className="w-3 h-3" /> };
    }
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="text-center text-muted-foreground py-8 animate-pulse">載入公告中...</div>
      ) : announcements.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">目前沒有公告</div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="space-y-3"
        >
          {announcements.map((item) => {
            const typeConf = getTypeConfig(item.type);
            const hasContent = !!item.content?.trim();
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="group rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md p-4 md:p-5 cursor-pointer"
                onClick={() => hasContent && setSelectedItem(item)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border", typeConf.color)}>
                        {typeConf.icon}
                        {typeConf.label}
                      </span>
                      {item.pinned && (
                        <Pin className="h-3 w-3 text-primary" />
                      )}
                      {isNew(item.date) && (
                        <span className="text-[10px] font-bold text-success">NEW</span>
                      )}
                      <span className="text-[11px] text-muted-foreground">{item.date}</span>
                    </div>
                    <h3 className="text-sm font-semibold leading-snug">{item.title}</h3>
                  </div>
                  {hasContent && (
                    <span className="shrink-0 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      閱讀更多 →
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <Dialog open={!!selectedItem} onOpenChange={(o) => !o && setSelectedItem(null)}>
        <DialogContent className="w-[92vw] max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogTitle className="sr-only">站內公告詳情</DialogTitle>
          {selectedItem && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    {(() => { const tc = getTypeConfig(selectedItem.type); return (
                      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border", tc.color)}>
                        {tc.icon}{tc.label}
                      </span>
                    ); })()}
                    {selectedItem.pinned && <Pin className="h-3 w-3 text-primary" />}
                    <span className="text-xs text-muted-foreground">{selectedItem.date}</span>
                  </div>
                  <h3 className="text-lg font-bold leading-tight">{selectedItem.title}</h3>
                </div>
              </div>

              {selectedItem.content ? (
                <div className="rounded-xl bg-muted/30 p-4 text-sm leading-relaxed markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                    {selectedItem.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground">
                  <Bell className="mx-auto mb-3 h-8 w-8 opacity-20" />
                  <p>這則公告沒有附加詳細內容。</p>
                </div>
              )}

              <div className="flex justify-end">
                <Button variant="outline" className="rounded-xl" onClick={() => setSelectedItem(null)}>
                  關閉
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── 整合頁面 ──────────────────────────────────────────────────────────────────

export default function AnnouncementsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="section-icon">
          <Megaphone className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-bold">公告</h2>
      </div>

      <Tabs defaultValue="school" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="school">學校公告</TabsTrigger>
          <TabsTrigger value="site">站內公告</TabsTrigger>
        </TabsList>
        <TabsContent value="school">
          <SchoolAnnouncements />
        </TabsContent>
        <TabsContent value="site">
          <SiteAnnouncements />
        </TabsContent>
      </Tabs>
    </div>
  );
}