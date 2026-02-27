import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Utensils, ChevronDown, ChevronUp, Calendar, ImageOff } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { zhTW } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface DishItem {
    category: string;
    name: string;
    image: string;
}

interface LunchData {
    last_updated: string;
    week_data: {
        [date: string]: DishItem[] | string;
    };
}

// 各分類對應的顏色
const categoryColors: Record<string, string> = {
    主食: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20",
    主菜: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20",
    副菜: "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/20",
    蔬菜: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20",
    湯品: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20",
    附餐: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/20",
};

// 各分類的預設顏色
const defaultCategoryColor = "bg-muted/50 text-muted-foreground border-border";

function DishCard({ dish, index }: { dish: DishItem; index: number }) {
    const [imgError, setImgError] = useState(false);
    const colorClass = categoryColors[dish.category] ?? defaultCategoryColor;

    return (
        <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.04 }}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-card border border-border/60 hover:border-primary/20 hover:shadow-sm transition-all"
        >
            {/* 縮圖 */}
            <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                {!imgError && dish.image ? (
                    <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                        loading="lazy"
                    />
                ) : (
                    <ImageOff className="h-5 w-5 text-muted-foreground/40" />
                )}
            </div>
            {/* 資訊 */}
            <div className="flex-1 min-w-0">
                <span className={cn(
                    "inline-block text-[10px] font-bold px-1.5 py-0.5 rounded border mb-1",
                    colorClass
                )}>
                    {dish.category}
                </span>
                <p className="text-sm font-medium text-foreground/90 leading-snug truncate">{dish.name}</p>
            </div>
        </motion.div>
    );
}

export const LunchMenu: React.FC = () => {
    const [lunchData, setLunchData] = useState<LunchData | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedDay, setExpandedDay] = useState<string | null>(null);
    const today = new Date();

    useEffect(() => {
        const fetchLunch = async () => {
            try {
                const response = await fetch("/data/lunch.json");
                const data: LunchData = await response.json();
                setLunchData(data);

                // 工作日自動展開今天，週末展開週一
                const todayStr = format(today, "yyyy-MM-dd");
                const dayOfWeek = today.getDay();
                if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                    setExpandedDay(todayStr);
                } else {
                    const monday = startOfWeek(today, { weekStartsOn: 1 });
                    setExpandedDay(format(monday, "yyyy-MM-dd"));
                }
            } catch (error) {
                console.error("Failed to fetch lunch data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLunch();
    }, []);

    const weekDays = Array.from({ length: 5 }).map((_, i) => {
        const date = addDays(startOfWeek(today, { weekStartsOn: 1 }), i);
        return {
            date,
            dateStr: format(date, "yyyy-MM-dd"),
            dayLabel: format(date, "EEEE", { locale: zhTW }),
            displayDate: format(date, "MM/dd"),
        };
    });

    if (loading) {
        return (
            <section className="mb-12 scroll-mt-20 animate-pulse">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="h-10 w-48 bg-primary/20 rounded-lg"></div>
                    <div className="h-8 w-32 bg-muted/30 rounded-full"></div>
                </div>
                <Card className="w-full overflow-hidden">
                    <CardContent className="p-0">
                        <div className="space-y-1 p-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-16 bg-primary/10 rounded-xl"></div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </section>
        );
    }

    return (
        <section id="lunch" className="mb-12 scroll-mt-20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-3">
                    <Utensils className="h-8 w-8 text-primary" />
                    營養午餐
                </h2>
                {lunchData?.last_updated && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 opacity-70 bg-muted/30 px-3 py-1.5 rounded-full border border-primary/10">
                        <Calendar className="h-3.5 w-3.5" />
                        最後更新：{lunchData.last_updated}
                    </div>
                )}
            </div>

            <Card className="w-full bg-card/50 backdrop-blur-md border-primary/20 shadow-xl overflow-hidden">
                <CardContent className="p-0">
                    <div className="divide-y divide-border/40">
                        {weekDays.map((day) => {
                            const isToday = isSameDay(day.date, today);
                            const isExpanded = expandedDay === day.dateStr;
                            const rawData = lunchData?.week_data?.[day.dateStr];
                            const hasNoData = !rawData || rawData === "無資料";
                            const dishes: DishItem[] = hasNoData ? [] : (rawData as DishItem[]);

                            // 摘要文字
                            const summaryText = hasNoData
                                ? "無供餐資訊"
                                : dishes.map((d) => d.name).join("、");

                            return (
                                <div key={day.dateStr} className="group">
                                    <button
                                        onClick={() => setExpandedDay(isExpanded ? null : day.dateStr)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-4 py-3 text-left transition-all hover:bg-primary/5",
                                            isToday
                                                ? "bg-primary/5 border-l-4 border-primary"
                                                : "border-l-4 border-transparent"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* 日期方塊 */}
                                            <div className={cn(
                                                "flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all shadow-sm shrink-0",
                                                isToday
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted text-muted-foreground"
                                            )}>
                                                <span className="text-[10px] font-bold">{day.dayLabel}</span>
                                                <span className="text-base font-black leading-none">{day.displayDate}</span>
                                            </div>

                                            {/* 菜色摘要 */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h4 className={cn(
                                                        "font-bold text-sm",
                                                        isToday ? "text-primary" : "text-foreground"
                                                    )}>
                                                        {day.dayLabel}
                                                    </h4>
                                                    {isToday && (
                                                        <span className="px-1.5 py-0.5 bg-primary text-[9px] font-bold text-primary-foreground rounded-full">
                                                            今天
                                                        </span>
                                                    )}
                                                </div>
                                                {!isExpanded && (
                                                    <p className="text-xs text-muted-foreground line-clamp-1 max-w-[260px]">
                                                        {summaryText}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {isExpanded ? (
                                            <ChevronUp className="h-4 w-4 text-primary transition-transform shrink-0" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-hover:text-primary shrink-0" />
                                        )}
                                    </button>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                                className="overflow-hidden bg-muted/20"
                                            >
                                                <div className="px-4 pb-4 pt-2">
                                                    {dishes.length > 0 ? (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                            {dishes.map((dish, idx) => (
                                                                <DishCard key={idx} dish={dish} index={idx} />
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="py-6 flex flex-col items-center justify-center text-muted-foreground bg-muted/30 rounded-xl border border-dashed border-primary/20">
                                                            <Utensils className="h-7 w-7 mb-2 opacity-20" />
                                                            <span className="italic text-sm">當日暫無供餐資訊</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </section>
    );
};
