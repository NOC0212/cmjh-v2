import { Star, ExternalLink, Calendar as CalendarIcon, Trash2, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";
import { useState } from "react";

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
                                className="group bg-card rounded-lg border border-border hover:border-primary/50 transition-all overflow-hidden"
                            >
                                <div 
                                    className={`flex items-start gap-3 p-4 ${isAnnouncement ? 'cursor-pointer hover:bg-primary/5' : ''} ${isExpanded ? 'bg-primary/5' : ''}`}
                                    onClick={() => isAnnouncement && toggleExpand(item.id)}
                                >
                                    {/* 根據收藏類型顯示對應圖示 */}
                                    {isAnnouncement ? (
                                        <ExternalLink className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                    ) : (
                                        <CalendarIcon className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium">
                                            {item.title}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {item.date}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        {/* 移除收藏操作按鈕 */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFavorite(item.id);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        {isAnnouncement && (
                                            <div className="text-muted-foreground transition-transform duration-300">
                                                {isExpanded ? <ChevronLeft className="h-4 w-4 -rotate-90" /> : <ChevronRight className="h-4 w-4" />}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {isExpanded && isAnnouncement && (
                                    <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-1 duration-300">
                                        <div className="h-px bg-border mb-4" />
                                        <div className="space-y-4">
                                            <div className="text-sm text-card-foreground/80 leading-relaxed whitespace-pre-wrap">
                                                {item.content}
                                            </div>
                                            
                                            {item.links && item.links.length > 0 && (
                                                <div className="grid grid-cols-1 gap-2 pt-2">
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

                                            {item.url && (
                                                <div className="pt-2 flex justify-end">
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
