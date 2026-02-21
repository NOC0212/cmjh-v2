import { useState, useEffect } from "react";
import { Megaphone, Pin, ChevronDown, Bell, Zap, Info, Wrench } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface SiteAnnouncement {
    id: string;
    title: string;
    date: string;
    type?: "update" | "alert" | "info" | "maintenance" | string;
    pinned?: boolean;
    content?: string;
}

export function SiteAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<SiteAnnouncement[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        fetch("/data/site-announcements.json")
            .then((res) => res.json())
            .then((data: SiteAnnouncement[]) => {
                // 將置頂的公告移到最前面
                const sortedData = [...data].sort((a, b) => {
                    if (a.pinned && !b.pinned) return -1;
                    if (!a.pinned && b.pinned) return 1;
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                });
                setAnnouncements(sortedData);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);

    // 判斷是否為 7 天內的新公告
    const isNew = (dateStr: string) => {
        const annDate = new Date(dateStr);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - annDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
    };

    const getTypeConfig = (type?: string) => {
        switch (type) {
            case "update": return { label: "更新", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: <Zap className="w-3 h-3 mr-1" /> };
            case "alert": return { label: "重要", color: "bg-red-500/10 text-red-500 border-red-500/20", icon: <Bell className="w-3 h-3 mr-1" /> };
            case "maintenance": return { label: "維護", color: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: <Wrench className="w-3 h-3 mr-1" /> };
            case "info":
            default: return { label: "資訊", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: <Info className="w-3 h-3 mr-1" /> };
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: import("framer-motion").Variants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="space-y-6 text-foreground">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Megaphone className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold">本站公告</h2>
            </div>

            <div className="space-y-3">
                {loading ? (
                    <div className="text-center text-muted-foreground py-8 animate-pulse">
                        載入公告中...
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        目前沒有公告
                    </div>
                ) : (
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="space-y-3"
                    >
                        {announcements.map((item) => {
                            const isExpanded = expandedId === item.id;
                            const hasContent = !!item.content;
                            const typeConfig = getTypeConfig(item.type);
                            const newItem = isNew(item.date);

                            return (
                                <motion.div
                                    key={item.id}
                                    variants={itemVariants}
                                    className={`group rounded-xl border transition-all duration-300 overflow-hidden ${
                                        item.pinned 
                                            ? "border-primary/50 bg-primary/5 shadow-sm" 
                                            : "border-border bg-card hover:border-primary/40 hover:bg-muted/50"
                                    }`}
                                >
                                    <div 
                                        className={`flex flex-col sm:flex-row sm:items-center p-4 gap-4 ${hasContent ? 'cursor-pointer' : ''}`}
                                        onClick={() => hasContent && setExpandedId(isExpanded ? null : item.id)}
                                    >
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            {item.pinned ? (
                                                <div className="mt-0.5 p-1.5 bg-primary/20 rounded-md text-primary shrink-0">
                                                    <Pin className="h-4 w-4" />
                                                </div>
                                            ) : (
                                                <div className="mt-0.5 p-1.5 bg-muted rounded-md text-muted-foreground shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                    <Megaphone className="h-4 w-4" />
                                                </div>
                                            )}
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                                    {item.pinned && (
                                                        <Badge variant="secondary" className="bg-primary/20 hover:bg-primary/30 text-primary border-0 rounded-sm px-1.5 py-0 text-[10px] font-semibold">
                                                            置頂
                                                        </Badge>
                                                    )}
                                                    {newItem && (
                                                        <Badge variant="destructive" className="rounded-sm px-1.5 py-0 text-[10px] font-semibold animate-pulse">
                                                            NEW
                                                        </Badge>
                                                    )}
                                                    {item.type && (
                                                        <Badge variant="outline" className={`rounded-sm px-1.5 py-0 text-[10px] font-medium border ${typeConfig.color} flex items-center`}>
                                                            {typeConfig.icon}
                                                            {typeConfig.label}
                                                        </Badge>
                                                    )}
                                                    <span className="text-xs text-muted-foreground ml-auto sm:ml-2">
                                                        {item.date}
                                                    </span>
                                                </div>
                                                <div className={`text-sm sm:text-base font-medium leading-snug ${item.pinned ? 'text-primary' : 'group-hover:text-primary transition-colors'}`}>
                                                    {item.title}
                                                </div>
                                            </div>
                                        </div>

                                        {hasContent && (
                                            <div className="hidden sm:flex shrink-0 items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors text-muted-foreground">
                                                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                                            </div>
                                        )}
                                        
                                        {/* Mobile expand indicator */}
                                        {hasContent && (
                                            <div className="sm:hidden flex items-center gap-1 text-xs text-muted-foreground mt-2 font-medium">
                                                {isExpanded ? '收起內容' : '展開閱讀'}
                                                <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                                            </div>
                                        )}
                                    </div>

                                    <AnimatePresence initial={false}>
                                        {isExpanded && hasContent && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                            >
                                                <div className="px-5 pb-5 pt-1 sm:px-14 sm:pt-0">
                                                    <div className="h-px w-full bg-border/50 mb-4 sm:hidden" />
                                                    <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap bg-muted/30 p-4 rounded-lg border border-border/50">
                                                        {item.content}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
