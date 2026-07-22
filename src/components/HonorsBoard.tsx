import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink, Star, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";

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
    const [direction, setDirection] = useState<'left' | 'right'>('right');

    useEffect(() => {
        fetch("/data/honors.json")
            .then((res) => { if (!res.ok) throw new Error("Failed to fetch honors"); return res.json(); })
            .then((data) => {
                setHonors(data);
                setLoading(false);
                const validIds = data.map((honor: Honor) => `honor-${honor.date}-${honor.title}`);
                cleanupFavorites("honor", validIds);
            })
            .catch(() => setLoading(false));
    }, [cleanupFavorites]);

    const totalPages = Math.ceil(honors.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentHonors = honors.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePrevPage = () => { setDirection('left'); setCurrentPage((prev) => Math.max(prev - 1, 1)); };
    const handleNextPage = () => { setDirection('right'); setCurrentPage((prev) => Math.min(prev + 1, totalPages)); };

    if (loading) {
        return (
            <section id="honors">
                <div className="mb-6 h-8 w-48 rounded-lg bg-muted animate-pulse" />
                <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-start gap-3">
                                <Skeleton className="h-5 w-16 shrink-0 rounded-md" />
                                <Skeleton className="h-5 flex-1 rounded-md" />
                                <Skeleton className="h-5 w-5 shrink-0 rounded-md" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section id="honors">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="section-header-icon">
                        <Trophy className="h-4 w-4" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">榮譽榜</h2>
                </div>
                <div className="flex items-center gap-1.5 bg-muted/50 border border-border/40 rounded-xl p-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={handlePrevPage} disabled={currentPage === 1}>
                        <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <span className="min-w-[72px] text-center text-[11px] text-muted-foreground font-medium">
                        {currentPage} / {totalPages}
                    </span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={handleNextPage} disabled={currentPage === totalPages}>
                        <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentPage}
                    initial={{ opacity: 0, x: direction === 'right' ? 16 : -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction === 'right' ? -16 : 16 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-2"
                >
                {currentHonors.map((honor, index) => {
                    const favoriteId = `honor-${honor.date}-${honor.title}`;
                    const isFav = isFavorite(favoriteId);

                    return (
                        <div
                            key={favoriteId}
                            className="group rounded-xl border border-border/60 bg-card px-4 py-3 transition-all duration-200 hover:border-border hover:shadow-sm"
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-[11px] font-semibold text-primary-foreground bg-primary px-2 py-1 rounded-md leading-none shrink-0 mt-0.5">
                                    {honor.date}
                                </span>
                                <a
                                    href={honor.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 text-sm font-medium text-card-foreground group-hover:text-primary transition-colors leading-snug"
                                >
                                    {honor.title}
                                </a>
                                <div className="flex items-center gap-0.5 shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 rounded-lg"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (isFav) { removeFavorite(favoriteId); }
                                            else { addFavorite({ id: favoriteId, type: "honor", title: honor.title, date: honor.date, url: honor.url }); }
                                        }}
                                    >
                                        <Star className={cn("h-3.5 w-3.5", isFav ? "fill-primary text-primary" : "text-muted-foreground")} />
                                    </Button>
                                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                                </div>
                            </div>
                        </div>
                    );
                })}
                </motion.div>
            </AnimatePresence>
        </section>
    );
}
