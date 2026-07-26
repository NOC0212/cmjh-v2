import { useState } from "react";
import { cn } from "@/lib/utils";
import { Star, ExternalLink, Trash2, ChevronDown, FileText, Megaphone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";
import DOMPurify from "dompurify";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

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
    const [selectedFavorite, setSelectedFavorite] = useState<typeof favorites[number] | null>(null);

    return (
        <div className="space-y-6 text-foreground">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Star className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold">我的收藏</h2>
            </div>

            <div className="space-y-3">
                {favorites.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8 border border-dashed border-border rounded-lg">
                        尚無收藏項目
                    </div>
                ) : (
                    favorites.map((item) => {
                        const isAnnouncement = item.type === "announcement";

                        return (
                            <div
                                key={item.id}
                                className="group bg-card rounded-2xl border border-border hover:border-primary/30 transition-all shadow-sm hover:shadow-md"
                            >
                                <div 
                                    className={cn(
                                        "flex items-start gap-4 p-4 transition-colors",
                                        isAnnouncement ? 'cursor-pointer hover:bg-primary/5' : ''
                                    )}
                                    onClick={() => isAnnouncement && setSelectedFavorite(item)}
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

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full shrink-0 hover:bg-destructive/10 hover:text-destructive"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFavorite(item.id);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <Dialog open={!!selectedFavorite} onOpenChange={(open) => !open && setSelectedFavorite(null)}>
                <DialogContent className="w-[92vw] max-w-xl overflow-hidden rounded-3xl border-border bg-card p-0 shadow-2xl outline-none [&>button]:right-5 [&>button]:top-5 [&>button]:flex [&>button]:h-8 [&>button]:w-8 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:bg-black/30 [&>button]:text-white [&>button]:backdrop-blur-md hover:[&>button]:bg-black/50">
                    <DialogTitle className="sr-only">收藏內容</DialogTitle>

                    <div className="p-6 sm:p-8 pt-14">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                                <Star className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold leading-tight text-foreground">{selectedFavorite?.title}</h3>
                                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{selectedFavorite?.date}</span>
                                    {selectedFavorite?.category && (
                                        <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-semibold leading-none", tagColorClass(selectedFavorite.category))}>
                                            {selectedFavorite.category}
                                        </span>
                                    )}
                                    {selectedFavorite?.source && (
                                        <span>{selectedFavorite.source}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="max-h-[50vh] overflow-y-auto overflow-x-auto pr-2 custom-scrollbar min-w-0">
                            {selectedFavorite?.content ? (
                                <div
                                    className="text-sm leading-relaxed text-foreground/90 [&_table]:w-full [&_table]:table-fixed [&_table]:border-collapse [&_table]:text-xs [&_td]:border [&_td]:border-border/60 [&_td]:p-2 [&_td]:break-words [&_th]:border [&_th]:border-border/60 [&_th]:bg-muted/50 [&_th]:p-2 [&_th]:break-words [&_th]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:hover:no-underline [&_img]:max-w-full [&_img]:rounded-lg [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1"
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedFavorite.content) }}
                                />
                            ) : (
                                <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground">
                                    <Star className="mx-auto mb-3 h-8 w-8 opacity-20" />
                                    <p>這則公告沒有詳細內容。</p>
                                </div>
                            )}

                            {selectedFavorite && selectedFavorite.links && selectedFavorite.links.length > 0 && (
                                <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {selectedFavorite.links.map((link, lIdx) => (
                                        <a
                                            key={lIdx}
                                            href={link.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 rounded-xl border border-primary/15 bg-primary/5 px-3 py-2 text-foreground transition-all hover:bg-primary hover:text-primary-foreground group"
                                        >
                                            <div className="rounded-lg bg-primary/10 p-1.5 text-primary transition-colors group-hover:bg-white/20 group-hover:text-primary-foreground">
                                                <FileText className="h-3.5 w-3.5" />
                                            </div>
                                            <span className="truncate text-xs font-medium group-hover:text-primary-foreground">{link.name}</span>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedFavorite?.url && (
                            <div className="mt-6 flex justify-end">
                                <a
                                    href={selectedFavorite.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                                >
                                    查看原始公告
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
