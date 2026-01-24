import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Utensils, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { zhTW } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface DayMenu {
    Menu: string[];
}

interface LunchData {
    [date: string]: DayMenu | string | undefined;
    LastUpdate?: string;
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
                const data = await response.json();
                setLunchData(data);

                // 如果是工作日則自動展開今天
                const todayStr = format(today, "yyyy-MM-dd");
                const dayOfWeek = today.getDay(); // 0 是週日，1-5 是週一至週五
                if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                    setExpandedDay(todayStr);
                } else {
                    // 如果是週末，展開週一
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
                <Card className="w-full bg-card/50 backdrop-blur-md border-primary/20 shadow-xl overflow-hidden">
                    <CardContent className="p-0">
                        <div className="space-y-4 p-4">
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
                {lunchData?.LastUpdate && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 opacity-70 bg-muted/30 px-3 py-1.5 rounded-full border border-primary/10">
                        <Calendar className="h-3.5 w-3.5" />
                        最後更新：{lunchData.LastUpdate}
                    </div>
                )}
            </div>
            <Card className="w-full bg-card/50 backdrop-blur-md border-primary/20 shadow-xl overflow-hidden">
                <CardContent className="p-0">
                    <div className="divide-y divide-primary/5">
                        {weekDays.map((day) => {
                            const isToday = isSameDay(day.date, today);
                            const isExpanded = expandedDay === day.dateStr;
                            const menuData = lunchData?.[day.dateStr] as DayMenu | undefined;
                            const menuItems = menuData?.Menu || [];

                            return (
                                <div key={day.dateStr} className="group">
                                    <button
                                        onClick={() => setExpandedDay(isExpanded ? null : day.dateStr)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-4 text-left transition-all hover:bg-primary/5",
                                            isToday && "bg-primary/5 border-l-4 border-primary",
                                            !isToday && "border-l-4 border-transparent"
                                        )}
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className={cn(
                                                "flex flex-col items-center justify-center w-20 h-16 rounded-xl transition-all shadow-sm",
                                                isToday ? "bg-primary text-primary-foreground scale-105" : "bg-muted text-muted-foreground"
                                            )}>
                                                <span className="text-[11px] font-bold uppercase mb-0.5">{day.dayLabel}</span>
                                                <span className="text-lg font-black leading-none">{day.displayDate}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className={cn(
                                                        "font-bold text-base",
                                                        isToday ? "text-primary" : "text-foreground"
                                                    )}>
                                                        {day.dayLabel}
                                                    </h4>
                                                    {isToday && (
                                                        <span className="px-2 py-0.5 bg-primary text-[10px] font-bold text-primary-foreground rounded-full animate-pulse">
                                                            今天
                                                        </span>
                                                    )}
                                                </div>
                                                {!isExpanded && (
                                                    <p className="text-sm text-muted-foreground line-clamp-1 max-w-[280px]">
                                                        {menuItems.length > 0 ? menuItems.join("、") : "無供餐資訊"}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {isExpanded ? (
                                            <ChevronUp className="h-5 w-5 text-primary transition-transform" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-hover:text-primary" />
                                        )}
                                    </button>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="overflow-hidden bg-gradient-to-b from-primary/5 to-transparent"
                                            >
                                                <div className="pl-28 pr-6 pb-6 pt-2">
                                                    {menuItems.length > 0 ? (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            {menuItems.map((item, idx) => (
                                                                <motion.div
                                                                    initial={{ x: -10, opacity: 0 }}
                                                                    animate={{ x: 0, opacity: 1 }}
                                                                    transition={{ delay: idx * 0.05 }}
                                                                    key={idx}
                                                                    className="flex items-center gap-3 p-2 rounded-lg bg-card/30 border border-primary/5 hover:border-primary/20 transition-colors"
                                                                >
                                                                    <div className="h-2 w-2 rounded-full bg-primary/60 shrink-0 shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                                                                    <span className="text-sm font-medium text-foreground/90">{item}</span>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="py-6 flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-primary/20">
                                                            <Utensils className="h-8 w-8 mb-2 opacity-20" />
                                                            <span className="italic text-sm font-medium">當日暫無供餐資訊</span>
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
