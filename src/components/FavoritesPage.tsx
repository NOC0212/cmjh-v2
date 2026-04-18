import { useState } from "react";
import { cn } from "@/lib/utils";
import { Star, ExternalLink, Trash2, ChevronDown, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";

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
  if (!tag) return "bg-muted text-muted-foreground border-border";
  return TAG_COLOR_CLASSES[hashTag(tag) % TAG_COLOR_CLASSES.length];
}

export function FavoritesPage() {
    const { favorites, removeFavorite } = useFavorites();
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const toggleExpand = (id: string) => {
        const newExpandedIds = new Set(expandedIds);
        if (newExpandedIds.has(id)) {
            newExpandedIds.delete(id);
        } else {
            newExpandedIds.add(id);
        }
        setExpandedIds(newExpandedIds);
    };

    return (
        <div className="space-y-6 text-foreground">
            {/* 頁面標題列 */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Star className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold">我的收藏</h2>
            </div>

            {/* 收藏清單列舉區域 */}
            <div className="space-y-3">
                {favorites.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8 border border-dashed border-border rounded-lg">
                        尚無收藏項目
                    </div>
                ) : (
                    favorites.map((item) => {
                        const isExpanded = expandedIds.has(item.id);
                        const isAnnouncement = item.type === "announcement";

                        return (
                            <div
                                key={item.id}
                                className="group bg-card rounded-2xl border border-border hover:border-primary/30 transition-all overflow-hidden shadow-sm hover:shadow-md"
                            >
                                <div 
                                    className={cn(
                                        "flex items-start gap-4 p-4 transition-colors",
                                        isAnnouncement ? 'cursor-pointer' : '', 
                                        isExpanded ? 'bg-primary/5' : 'hover:bg-primary/5'
                                    )}
                                    onClick={() => isAnnouncement && toggleExpand(item.id)}
                                >
                                        <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
                                            <div className="rounded-lg border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                                                {item.date}
                                            </div>
                                            {isAnnouncement && item.category && (
                                                <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", tagColorClass(item.category))}>
                                                    {item.category}
                                                </span>
                                            )}
                                            {isAnnouncement && item.source && (
                                                <span className="text-[11px] text-muted-foreground">
                                                    來源：{item.source}
                                                </span>
                                            )}
                                            {!isAnnouncement && (
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                                    日程提醒
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                                            {item.title}
                                        </h3>
                                    </div>

                                    <div className="flex items-center gap-1 flex-shrink-0 pt-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFavorite(item.id);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        {isAnnouncement && (
                                            <div className={cn("text-muted-foreground transition-transform duration-300", isExpanded && "rotate-180")}>
                                                <ChevronDown className="h-4 w-4" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {isExpanded && isAnnouncement && (
                                    <div className="px-4 pb-5 pt-0 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="space-y-4">
                                            <div className="whitespace-pre-wrap rounded-xl border border-border/70 bg-muted/30 p-4 text-sm leading-relaxed text-foreground/90">
                                                {item.content || "這則公告沒有詳細內容。"}
                                            </div>
                                            
                                            {item.links && item.links.length > 0 && (
                                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                    {item.links.map((link, lIdx) => (
                                                        <a
                                                            key={lIdx}
                                                            href={link.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10 text-card-foreground group/link hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                                                        >
                                                            <div className="p-2 bg-primary/10 rounded-lg group-hover/link:bg-white/20">
                                                                <FileText className="h-4 w-4 text-primary group-hover/link:text-primary-foreground" />
                                                            </div>
                                                            <span className="text-xs font-bold truncate flex-1">
                                                                {link.name}
                                                            </span>
                                                        </a>
                                                    ))}
                                                </div>
                                            )}

                                            {item.url && (
                                                <div className="flex justify-end pt-1">
                                                    <a
                                                        href={item.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                                                    >
                                                        查看原始公告
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
