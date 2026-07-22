import { Home, Search, Megaphone, Star, Settings, RefreshCw, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFavorites } from "@/hooks/useFavorites";
import { AppSidebar } from "@/components/AppSidebar";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { isAdminUnlocked } from "@/lib/app-version";
import { cn } from "@/lib/utils";

export type NavPage = "home" | "search" | "announcements" | "favorites" | "settings" | "admin";

interface NavItem {
    id: NavPage;
    label: string;
    icon: typeof Home;
}

const navItems: NavItem[] = [
    { id: "home", label: "主頁", icon: Home },
    { id: "search", label: "搜尋", icon: Search },
    { id: "announcements", label: "公告", icon: Megaphone },
    { id: "favorites", label: "收藏", icon: Star },
    { id: "settings", label: "設定", icon: Settings },
];

const adminNavItem: NavItem = {
    id: "admin",
    label: "管理",
    icon: Shield,
};

interface ResponsiveNavProps {
    currentPage: NavPage;
    onPageChange: (page: NavPage) => void;
    mode?: "header" | "footer" | "full";
}

export function ResponsiveNav({ currentPage, onPageChange, mode = "full" }: ResponsiveNavProps) {
    const isMobile = useIsMobile();
    const { favorites } = useFavorites();
    const [isHovered, setIsHovered] = useState(false);
    const [headerHidden, setHeaderHidden] = useState(false);
    const lastScrollY = useRef(0);

    useEffect(() => {
        if (!isMobile) return;
        const container = document.querySelector("main");
        if (!container) return;
        const handleScroll = () => {
            const currentY = container.scrollTop;
            if (currentY > lastScrollY.current && currentY > 80) {
                setHeaderHidden(true);
            } else {
                setHeaderHidden(false);
            }
            lastScrollY.current = currentY;
        };
        container.addEventListener("scroll", handleScroll, { passive: true });
        return () => container.removeEventListener("scroll", handleScroll);
    }, [isMobile]);

    const handleRefresh = () => {
        window.location.reload();
    };

    const handleNavClick = (item: NavItem) => {
        onPageChange(item.id);
    };

    const visibleItems = isAdminUnlocked()
        ? [...navItems, adminNavItem]
        : navItems;

    const renderNavItem = (item: NavItem, isFooter = false) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;

        return (
            <button
                key={item.id}
                type="button"
                className={cn(
                    "relative flex items-center justify-center transition-all duration-200",
                    isFooter
                        ? "flex-col h-12 flex-1 min-w-0 gap-0.5"
                        : "h-12 w-full gap-3 px-2",
                    !isFooter && "hover:bg-primary/5 rounded-xl"
                )}
                onClick={() => handleNavClick(item)}
            >
                {isFooter && isActive && (
                    <motion.div
                        layoutId="nav-active-pill"
                        className="absolute -top-0.5 inset-x-0 mx-auto w-8 h-1 bg-primary rounded-full"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                )}
                <div className={cn(
                    "relative z-10 flex items-center justify-center",
                    isFooter ? "flex-col gap-0.5" : "gap-3 w-full"
                )}>
                    <div className="relative">
                        <div className={cn(
                            "flex items-center justify-center rounded-xl transition-all duration-200",
                            isFooter ? "w-auto" : "w-8 h-8",
                            !isFooter && isActive && "bg-primary/10"
                        )}>
                            <Icon
                                className={cn(
                                    "transition-all duration-200",
                                    isFooter ? "h-5 w-5" : "h-5 w-5",
                                    isActive
                                        ? "text-primary stroke-[2.5px]"
                                        : "text-muted-foreground"
                                )}
                                fill={isActive && item.id !== "search" && item.id !== "settings" ? 'currentColor' : 'none'}
                            />
                        </div>
                        {item.id === "favorites" && favorites.length > 0 && (
                            <span className="absolute -top-1 -right-1.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-4 min-w-[16px] flex items-center justify-center px-1 shadow-sm">
                                {favorites.length > 9 ? "9+" : favorites.length}
                            </span>
                        )}
                    </div>
                    <span className={cn(
                        "font-medium transition-all duration-200",
                        isFooter ? "text-[10px] leading-tight" : "text-sm",
                        isActive ? "text-primary" : "text-muted-foreground"
                    )}>
                        {item.label}
                    </span>
                </div>
            </button>
        );
    };

    if (isMobile) {
        if (mode === "header") {
            return (
                <header className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-transform duration-300",
                    headerHidden ? "-translate-y-full" : "translate-y-0"
                )}>
                    <div className="glass">
                        <div className="pt-[env(safe-area-inset-top)]">
                            <div className="flex items-center justify-between h-14 px-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10">
                                        <img src="/favicon.png" alt="崇明國中" className="h-5 w-5" />
                                    </div>
                                    <h1 className="text-base font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                        崇明國中
                                    </h1>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleRefresh}
                                        className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
                                        title="重新整理頁面"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                    </Button>
                                    <AppSidebar />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
            );
        }

        if (mode === "footer") {
            return (
                <div className="fixed bottom-0 left-0 right-0 z-50">
                    <div className="pt-1">
                        <nav className="glass-strong rounded-t-2xl px-2 pb-[env(safe-area-inset-bottom,8px)]">
                            <div className="flex items-center justify-evenly h-14">
                                {visibleItems.map((item) => renderNavItem(item, true))}
                            </div>
                        </nav>
                    </div>
                </div>
            );
        }

        return null;
    }

    return (
        <motion.nav
            initial={false}
            animate={{ width: isHovered ? 220 : 64 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="fixed left-0 top-0 h-full z-50 flex flex-col bg-card border-r border-border/50 shadow-sm py-5 overflow-x-hidden"
        >
            <div className={cn("mb-6 flex flex-col gap-4 px-3", isHovered ? 'items-stretch' : 'items-center')}>
                <div className="flex items-center overflow-hidden">
                    <div className="flex items-center justify-center w-8 h-8 shrink-0 rounded-xl bg-primary/10">
                        <img src="/favicon.png" alt="崇明國中" className="h-5 w-5" />
                    </div>
                    {isHovered && (
                        <motion.h1
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-sm font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent whitespace-nowrap ml-2"
                        >
                            崇明國中
                        </motion.h1>
                    )}
                </div>

                <button
                    type="button"
                    onClick={handleRefresh}
                    className={cn(
                        "flex items-center gap-3 h-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all text-xs",
                        isHovered ? "px-2 w-full justify-start" : "w-9 justify-center"
                    )}
                >
                    <RefreshCw className="h-4 w-4 shrink-0" />
                    {isHovered && <span className="font-medium">重新整理</span>}
                </button>
            </div>

            <div className="flex-1 flex flex-col gap-1 px-2">
                {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onPageChange(item.id)}
                            className={cn(
                                "relative flex items-center h-10 rounded-xl transition-all duration-200",
                                isHovered ? "gap-3 px-2 w-full justify-start" : "w-10 justify-center mx-auto",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                            )}
                        >
                            <div className="relative">
                                <Icon
                                    className={cn(
                                        "h-5 w-5 shrink-0 transition-all",
                                        isActive && "stroke-[2.5px]"
                                    )}
                                    fill={isActive && item.id !== "search" && item.id !== "settings" ? 'currentColor' : 'none'}
                                />
                                {item.id === "favorites" && favorites.length > 0 && (
                                    <span className="absolute -top-1.5 -right-2 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full h-3.5 min-w-[14px] flex items-center justify-center px-0.5 shadow-sm">
                                        {favorites.length > 9 ? "9+" : favorites.length}
                                    </span>
                                )}
                            </div>
                            {isHovered && (
                                <motion.span
                                    initial={{ opacity: 0, x: -4 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-sm font-medium"
                                >
                                    {item.label}
                                </motion.span>
                            )}
                        </button>
                    );
                })}

            </div>

            <div className="mt-auto px-2">
                <div className={isHovered ? '' : 'flex justify-center'}>
                    <AppSidebar expanded={isHovered} />
                </div>
            </div>
        </motion.nav>
    );
}
