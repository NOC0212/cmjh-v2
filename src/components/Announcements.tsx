import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ExternalLink, Star, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useFavorites } from "@/hooks/useFavorites";

interface Announcement {
  date: string;
  title: string;
  url: string;
  content: string;
  links: { name: string; link: string }[];
}

const ITEMS_PER_PAGE = 10;

export function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const { addFavorite, removeFavorite, isFavorite, cleanupFavorites } = useFavorites();

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    setExpandedIndex(null);
  }, [currentPage]);

  useEffect(() => {
    const files = ["/data/announcements-p1.json", "/data/announcements-p2.json", "/data/announcements-p3.json"];
    
    Promise.all(files.map(file => fetch(file).then(res => res.json())))
      .then((dataArrays) => {
        const combinedData = dataArrays.flat();
        // 如果需要排序，可以在這裡按日期排序
        setAnnouncements(combinedData);
        setLoading(false);
        // 當公告加載時清理收藏夾
        const validIds = combinedData.map((ann: Announcement) =>
          `announcement-${ann.date}-${ann.title}`
        );
        cleanupFavorites("announcement", validIds);
      })
      .catch((error) => {
        console.error("Failed to load announcements:", error);
        setLoading(false);
      });
  }, [cleanupFavorites]);

  const totalPages = Math.ceil(announcements.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentAnnouncements = announcements.slice(startIndex, endIndex);

  const [direction, setDirection] = useState<'left' | 'right'>('right');

  const handlePrevPage = () => {
    setDirection('left');
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setDirection('right');
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  if (loading) {
    return (
      <section id="announcements" className="mb-12 scroll-mt-20">
        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">行政公告</h2>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl p-4 border border-border">
              <div className="flex items-start gap-3">
                <Skeleton className="h-6 w-20 flex-shrink-0" />
                <Skeleton className="h-6 flex-1" />
                <Skeleton className="h-4 w-4 flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="announcements" className="mb-12 scroll-mt-20">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">行政公告</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            上一頁
          </Button>
          <span className="text-sm text-muted-foreground min-w-[100px] text-center">
            第 {currentPage} / {totalPages} 頁
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            下一頁
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        key={currentPage}
        className={`space-y-3 ${direction === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left'}`}
      >
        {currentAnnouncements.map((announcement, index) => {
          const favoriteId = `announcement-${announcement.date}-${announcement.title}`;
          const isFav = isFavorite(favoriteId);
          const isExpanded = expandedIndex === index;

          return (
            <div
              key={index}
              className="group bg-card rounded-2xl border border-border hover:border-primary transition-all duration-300 hover:shadow-lg overflow-hidden"
            >
              <div 
                className={`p-4 cursor-pointer transition-colors ${isExpanded ? 'bg-primary/5' : 'hover:bg-primary/5'}`}
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xs text-primary-foreground font-medium bg-primary px-2 py-1 rounded flex-shrink-0">
                    {announcement.date}
                  </span>
                  <div className="flex-1 text-card-foreground group-hover:text-primary transition-colors font-medium">
                    {announcement.title}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isFav) {
                          removeFavorite(favoriteId);
                        } else {
                          addFavorite({
                            id: favoriteId,
                            type: "announcement",
                            title: announcement.title,
                            date: announcement.date,
                            url: announcement.url,
                            content: announcement.content,
                            links: announcement.links,
                          });
                        }
                      }}
                    >
                      <Star
                        className={`h-4 w-4 transition-colors ${isFav ? "fill-primary text-primary" : "text-muted-foreground"
                          }`}
                      />
                    </Button>
                    <div className="text-muted-foreground transition-transform duration-300">
                      {isExpanded ? <ChevronLeft className="h-4 w-4 -rotate-90" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-1 duration-300">
                  <div className="h-px bg-border mb-4" />
                  <div className="space-y-4">
                    <div className="text-sm text-card-foreground/80 leading-relaxed whitespace-pre-wrap">
                      {announcement.content}
                    </div>
                    
                    {announcement.links && announcement.links.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                        {announcement.links.map((link, lIdx) => (
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

                    <div className="pt-4 flex justify-end">
                      <a
                        href={announcement.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        查看原始公告
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
