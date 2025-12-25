import { Star, ExternalLink, Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";

export function FavoritesPage() {
    const { favorites, removeFavorite } = useFavorites();

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
                    favorites.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all"
                        >
                            {/* 根據收藏類型顯示對應圖示 */}
                            {item.type === "announcement" ? (
                                <ExternalLink className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            ) : (
                                <CalendarIcon className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                                {item.url ? (
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium hover:text-primary"
                                    >
                                        {item.title}
                                    </a>
                                ) : (
                                    <div className="text-sm font-medium">
                                        {item.title}
                                    </div>
                                )}
                                <div className="text-xs text-muted-foreground mt-1">
                                    {item.date}
                                </div>
                            </div>
                            {/* 移除收藏操作按鈕 */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 flex-shrink-0"
                                onClick={() => removeFavorite(item.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
