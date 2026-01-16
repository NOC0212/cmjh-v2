import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ExternalLink, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useFavorites } from "@/hooks/useFavorites";

interface Honor {
    date: string;
    title: string;
    url: string;
}

const ITEMS_PER_PAGE = 10;

export function HonorsBoard() {
    const [honors, setHonors] = useState<Honor[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const { addFavorite, removeFavorite, isFavorite, cleanupFavorites } = useFavorites();

    useEffect(() => {
        fetch("/data/honors.json")
            .then((res) => res.json())
            .then((data) => {
                setHonors(data);
                setLoading(false);
                // Cleanup favorites when honors are loaded
                const validIds = data.map((honor: Honor) =>
                    `honor-${honor.date}-${honor.title}`
                );
                cleanupFavorites("honor", validIds);
            })
            .catch((error) => {
                console.error("Failed to load honors:", error);
                setLoading(false);
            });
    }, [cleanupFavorites]);

    const totalPages = Math.ceil(honors.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentHonors = honors.slice(startIndex, endIndex);

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
            <section id="honors" className="mb-12 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">榮譽榜</h2>
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
        <section id="honors" className="mb-12 scroll-mt-20">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">榮譽榜</h2>
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
                {currentHonors.map((honor, index) => {
                    const favoriteId = `honor-${honor.date}-${honor.title}`;
                    const isFav = isFavorite(favoriteId);

                    return (
                        <div
                            key={index}
                            className="group bg-card rounded-2xl p-4 border border-border hover:border-primary transition-all duration-300 hover:shadow-lg hover:bg-primary/5"
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-xs text-primary-foreground font-medium bg-primary px-2 py-1 rounded flex-shrink-0">
                                    {honor.date}
                                </span>
                                <a
                                    href={honor.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 text-card-foreground group-hover:text-primary transition-colors font-medium"
                                >
                                    {honor.title}
                                </a>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 flex-shrink-0"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (isFav) {
                                            removeFavorite(favoriteId);
                                        } else {
                                            addFavorite({
                                                id: favoriteId,
                                                type: "honor",
                                                title: honor.title,
                                                date: honor.date,
                                                url: honor.url,
                                            });
                                        }
                                    }}
                                >
                                    <Star
                                        className={`h-4 w-4 transition-colors ${isFav ? "fill-primary text-primary" : "text-muted-foreground"
                                            }`}
                                    />
                                </Button>
                                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
