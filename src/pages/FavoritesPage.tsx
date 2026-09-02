import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Star,
  ExternalLink,
  Trash2,
  FileText,
  Megaphone,
  Calendar,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites, type Favorite } from "@/hooks/use-favorites";
import DOMPurify from "dompurify";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

/** 進場動畫延遲 */
const STAGGER_CLASSES = [
  "animate-stagger-1",
  "animate-stagger-2",
  "animate-stagger-3",
  "animate-stagger-4",
  "animate-stagger-5",
  "animate-stagger-6",
  "animate-stagger-7",
  "animate-stagger-8",
];

/** 收藏依類型分組 */
const TYPE_GROUPS: {
  type: Favorite["type"];
  label: string;
  icon: typeof Megaphone;
}[] = [
  { type: "announcement", label: "公告", icon: Megaphone },
  { type: "event", label: "日程提醒", icon: Calendar },
  { type: "honor", label: "榮譽榜", icon: Award },
];

export default function FavoritesPage() {
  const { favorites, removeFavorite } = useFavorites();
  const [selectedFavorite, setSelectedFavorite] = useState<Favorite | null>(null);

  const openItem = (item: Favorite) => {
    if (item.type === "announcement") {
      setSelectedFavorite(item);
    } else if (item.url) {
      window.open(item.url, "_blank", "noopener,noreferrer");
    }
  };

  const isClickable = (item: Favorite) =>
    item.type === "announcement" || !!item.url;

  return (
    <div className="space-y-6 text-foreground opacity-0 animate-fade-in">
      {/* 頁面標題列 */}
      <div className="flex items-center gap-3">
        <span className="section-icon">
          <Star className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-bold text-foreground">我的收藏</h2>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center text-muted-foreground py-8 border border-dashed border-border rounded-lg">
          尚無收藏項目
        </div>
      ) : (
        TYPE_GROUPS.map((group) => {
          const items = favorites.filter((f) => f.type === group.type);
          if (items.length === 0) return null;
          const GroupIcon = group.icon;

          return (
            <section key={group.type} className="space-y-3">
              {/* 分組標題 */}
              <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <GroupIcon className="h-3.5 w-3.5 text-primary" />
                {group.label} ({items.length})
              </h3>

              <div className="space-y-3">
                {items.map((item, idx) => {
                  const isAnnouncement = item.type === "announcement";
                  const clickable = isClickable(item);

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "group bg-card rounded-2xl border border-border hover:border-primary/30 transition-all shadow-sm hover:shadow-md opacity-0 animate-fade-in",
                        STAGGER_CLASSES[Math.min(idx, STAGGER_CLASSES.length - 1)],
                      )}
                    >
                      <div
                        className={cn(
                          "flex items-start gap-4 p-4 transition-colors",
                          clickable && "cursor-pointer hover:bg-primary/5",
                        )}
                        role={clickable ? "button" : undefined}
                        tabIndex={clickable ? 0 : undefined}
                        aria-label={clickable ? `開啟：${item.title}` : undefined}
                        onClick={() => clickable && openItem(item)}
                        onKeyDown={(e) => {
                          if (clickable && (e.key === "Enter" || e.key === " ")) {
                            e.preventDefault();
                            openItem(item);
                          }
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
                            <div className="rounded-lg border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                              {item.date}
                            </div>
                            {isAnnouncement && item.category && (
                              <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                {item.category}
                              </span>
                            )}
                            {isAnnouncement && item.source && (
                              <span className="text-[11px] text-muted-foreground">
                                來源：{item.source}
                              </span>
                            )}
                            {!isAnnouncement && item.url && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-primary">
                                <ExternalLink className="h-3 w-3" />
                                開啟連結
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
                          aria-label="移除收藏"
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
                })}
              </div>
            </section>
          );
        })
      )}

      {/* 公告詳細內容 Dialog */}
      <Dialog open={!!selectedFavorite} onOpenChange={(open) => !open && setSelectedFavorite(null)}>
        <DialogContent className="w-[92vw] max-w-xl overflow-hidden rounded-3xl border-border bg-card p-0 shadow-2xl outline-none">
          <DialogTitle className="sr-only">收藏內容</DialogTitle>

          <div className="p-6 sm:p-8 pt-14">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold leading-tight text-foreground">{selectedFavorite?.title}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{selectedFavorite?.date}</span>
                  {selectedFavorite?.category && (
                    <span className="rounded-md border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary">
                      {selectedFavorite.category}
                    </span>
                  )}
                  {selectedFavorite?.source && (
                    <span>{selectedFavorite.source}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="max-h-[50vh] overflow-y-auto overflow-x-auto pr-2 min-w-0">
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
