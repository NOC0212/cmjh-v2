import { Home, Search, Megaphone, Star, Settings, School, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFavorites } from "@/hooks/useFavorites";
import { AppSidebar } from "@/components/AppSidebar";
import { motion } from "framer-motion";
import { Scratchpad } from "@/components/Scratchpad";
import { useState } from "react";

// 頁面選單類型定義
export type NavPage = "home" | "search" | "announcements" | "favorites" | "settings";

const navItems: { id: NavPage; label: string; icon: typeof Home }[] = [
    { id: "home", label: "主頁", icon: Home },
    { id: "search", label: "搜尋", icon: Search },
    { id: "announcements", label: "公告", icon: Megaphone },
    { id: "favorites", label: "收藏", icon: Star },
    { id: "settings", label: "設定", icon: Settings },
];

interface ResponsiveNavProps {
    currentPage: NavPage;
    onPageChange: (page: NavPage) => void;
    mode?: "header" | "footer" | "full";
}

export function ResponsiveNav({ currentPage, onPageChange, mode = "full" }: ResponsiveNavProps) {
    const isMobile = useIsMobile();
    const { favorites } = useFavorites();
    const [scratchpadOpen, setScratchpadOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // 渲染導航按鈕項目
    const renderNavItem = (item: typeof navItems[0]) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;

        return (
            <Button
                key={item.id}
                variant="ghost"
                className={`relative flex items-center transition-all duration-300 rounded-xl overflow-hidden ${isActive
                    ? 'text-primary font-bold'
                    : 'hover:bg-primary/5 hover:text-primary text-muted-foreground'
                    } ${isMobile
                        ? 'flex-col justify-center h-auto py-2 px-3 flex-1 min-w-0 gap-1'
                        : `h-12 justify-start p-0 px-2 ${isHovered ? 'w-full' : 'w-12'}`
                    }`}
                onClick={() => onPageChange(item.id)}
            >
                {isActive && (
                    <motion.div
                        layoutId="nav-active-bg"
                        className="absolute inset-0 bg-primary/15 rounded-xl z-0"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                )}
                <div className={`relative z-10 flex items-center ${isMobile ? 'flex-col gap-1' : ''}`}>
                    <div className={`shrink-0 flex items-center justify-center ${isMobile ? '' : 'w-8'}`}>
                        <div className="relative">
                            <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                            {item.id === "favorites" && favorites.length > 0 && (
                                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                                    {favorites.length > 9 ? "9+" : favorites.length}
                                </span>
                            )}
                        </div>
                    </div>
                    {/* 手機版標籤或是桌面版展開時標籤 */}
                    {(isMobile || isHovered) && (
                        <motion.span
                            initial={!isMobile ? { opacity: 0, x: -10 } : false}
                            animate={{ opacity: 1, x: 0 }}
                            className={`${isMobile ? 'text-[10px]' : 'text-sm font-medium whitespace-nowrap'}`}
                        >
                            {item.label}
                        </motion.span>
                    )}
                </div>
            </Button>
        );
    };

    // 手機版渲染邏輯
    if (isMobile) {
        if (mode === "header") {
            return (
                <header className="bg-background/90 backdrop-blur-md border-b border-border/50 shrink-0 z-50">
                    <div className="pt-[env(safe-area-inset-top)]">
                        <div className="flex items-center justify-between h-14 px-4">
                            <div className="flex items-center gap-2">
                                <School className="h-5 w-5 text-primary" />
                                <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                    崇明國中
                                </h1>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setScratchpadOpen(true)}
                                    className="hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                                >
                                    <StickyNote className="h-5 w-5" />
                                </Button>
                                <AppSidebar />
                            </div>
                        </div>
                    </div>
                    <Scratchpad open={scratchpadOpen} onOpenChange={setScratchpadOpen} />
                </header>
            );
        }

        if (mode === "footer") {
            return (
                <div className="fixed bottom-6 left-0 right-0 px-4 z-50 pointer-events-none flex justify-center">
                    <nav className="bg-background/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg rounded-full overflow-hidden touch-none select-none pointer-events-auto max-w-md w-full">
                        <div className="flex items-center justify-around h-16 w-full px-2">
                            {navItems.map((item) => renderNavItem(item))}
                        </div>
                    </nav>
                </div>
            );
        }

        return null;
    }

    // 桌面版渲染邏輯
    return (
        <motion.nav
            initial={false}
            animate={{ width: isHovered ? 240 : 64 }}
            transition={{ type: "tween", duration: 0.2 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="fixed left-0 top-0 bg-background border-r border-border/50 flex flex-col items-center shrink-0 h-full py-6 z-50 shadow-xl px-4 overflow-hidden"
        >
            {/* Logo 區域 */}
            <div className={`mb-8 flex flex-col gap-4 w-full ${isHovered ? 'items-start' : 'items-center'}`}>
                <div className="flex items-center w-full overflow-hidden">
                    <div className="w-8 flex items-center justify-center shrink-0">
                        <div className="p-1 bg-primary/10 rounded-xl">
                            <School className="h-5 w-5 text-primary" />
                        </div>
                    </div>
                    {isHovered && (
                        <motion.h1
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent whitespace-nowrap pl-1"
                        >
                            崇明國中
                        </motion.h1>
                    )}
                </div>

                <Button
                    variant="ghost"
                    size={isHovered ? "default" : "icon"}
                    onClick={() => setScratchpadOpen(true)}
                    className={`h-12 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all rounded-xl p-0 px-2 ${isHovered ? 'w-full justify-start' : 'w-12 justify-center'}`}
                    title="快速便籤"
                >
                    <div className={`shrink-0 flex items-center justify-center ${isHovered ? 'w-8' : 'w-8'}`}>
                        <StickyNote className="h-5 w-5" />
                    </div>
                    {isHovered && <span className="font-medium text-sm">快速便籤</span>}
                </Button>
            </div>

            {/* 功能項區域 */}
            <div className={`flex-1 flex flex-col justify-center gap-2 w-full ${isHovered ? 'items-start' : 'items-center'}`}>
                {navItems.map((item) => renderNavItem(item))}
            </div>

            {/* 側邊欄腳部選單 */}
            <div className={`mt-auto w-full flex flex-col ${isHovered ? 'items-start' : 'items-center'}`}>
                <AppSidebar expanded={isHovered} />
            </div>
            <Scratchpad open={scratchpadOpen} onOpenChange={setScratchpadOpen} />
        </motion.nav>
    );
}
