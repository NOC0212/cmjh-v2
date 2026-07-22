import { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Megaphone, Pin, Bell, Zap, Info, Wrench, ExternalLink, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSiteAnnouncements } from "@/hooks/useSiteAnnouncements";

export function SiteAnnouncementsPage() {
    const { announcements: rawAnnouncements, isLoading } = useSiteAnnouncements();
    const [selectedItem, setSelectedItem] = useState<typeof rawAnnouncements[number] | null>(null);

    // 將置頂的公告移到最前面
    const announcements = useMemo(() => {
        const sortedData = [...rawAnnouncements].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        return sortedData;
    }, [rawAnnouncements]);

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
                {isLoading ? (
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
                                        className="flex items-start gap-3 p-4 cursor-pointer"
                                        onClick={() => hasContent && setSelectedItem(item)}
                                    >
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
                                                <span className="text-xs text-muted-foreground ml-auto">
                                                    {item.date}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className={`text-sm sm:text-base font-medium leading-snug ${item.pinned ? 'text-primary' : 'group-hover:text-primary transition-colors'}`}>
                                                    {item.title}
                                                </div>
                                                {hasContent && (
                                                    <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground/50 group-hover:text-primary/60 transition-colors" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </div>

            <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
                <DialogContent className="w-[92vw] max-w-xl overflow-hidden rounded-3xl border-border bg-card p-0 shadow-2xl outline-none [&>button]:right-5 [&>button]:top-5 [&>button]:flex [&>button]:h-8 [&>button]:w-8 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:bg-black/30 [&>button]:text-white [&>button]:backdrop-blur-md hover:[&>button]:bg-black/50 focus:[&>button]:ring-0 transition-all duration-300">
                    <DialogTitle className="sr-only">公告內容</DialogTitle>

                    <div className="relative aspect-video w-full overflow-hidden">
                        <img
                            src={selectedItem?.image_url || "/announcement.png"}
                            alt=""
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                                if (!e.currentTarget.dataset.fallback) {
                                    e.currentTarget.dataset.fallback = "true";
                                    e.currentTarget.src = "/announcement.png";
                                }
                            }}
                        />
                    </div>

                    <div className="p-6 sm:p-8">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                                    <Megaphone className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold leading-tight text-foreground">{selectedItem?.title}</h3>
                                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {selectedItem?.date}
                                    </div>
                                </div>
                            </div>
                            {selectedItem?.type && (
                                <Badge variant="outline" className={`rounded-sm px-1.5 py-0 text-[10px] font-medium border ${getTypeConfig(selectedItem.type).color} flex items-center`}>
                                    {getTypeConfig(selectedItem.type).icon}
                                    {getTypeConfig(selectedItem.type).label}
                                </Badge>
                            )}
                        </div>

                        <div className="max-h-[35vh] overflow-y-auto pr-2 custom-scrollbar">
                            {selectedItem?.content ? (
                                <div className="text-base leading-relaxed text-foreground/90 prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                                        {selectedItem.content}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground">
                                    <Bell className="mx-auto mb-3 h-8 w-8 opacity-20" />
                                    <p>這則公告沒有附加詳細內容。</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex justify-end">
                            <Button variant="outline" className="h-12 rounded-2xl font-semibold px-8" onClick={() => setSelectedItem(null)}>
                                關閉
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
