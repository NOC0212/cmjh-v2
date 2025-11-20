import { Star, ExternalLink, Calendar as CalendarIcon, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFavorites } from "@/hooks/useFavorites";

export function FavoritesDialog() {
  const { favorites, removeFavorite } = useFavorites();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 relative">
          <Star className="h-4 w-4" />
          <span className="hidden sm:inline">收藏</span>
          {favorites.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {favorites.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>我的收藏</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {favorites.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                尚無收藏項目
              </div>
            ) : (
              favorites.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all"
                >
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
                        className="text-sm font-medium text-foreground hover:text-primary"
                      >
                        {item.title}
                      </a>
                    ) : (
                      <div className="text-sm font-medium text-foreground">
                        {item.title}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {item.date}
                    </div>
                  </div>
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
