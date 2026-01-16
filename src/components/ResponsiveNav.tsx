import { Home, Search, Megaphone, Star, Settings, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFavorites } from "@/hooks/useFavorites";
import { AppSidebar } from "@/components/AppSidebar";

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

    // 渲染導航按鈕項目
    const renderNavItem = (item: typeof navItems[0]) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;

        return (
            <Button
                key={item.id}
                variant="ghost"
                className={`flex flex-col items-center justify-center gap-1 h-auto py-2 px-3 transition-all rounded-xl ${isActive
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-primary/5 hover:text-primary text-muted-foreground'
                    } ${isMobile ? 'flex-1 min-w-0' : 'w-12 h-12'}`}
                onClick={() => onPageChange(item.id)}
            >
                <div className="relative">
                    <Icon className="h-5 w-5" />
                    {item.id === "favorites" && favorites.length > 0 && (
                        <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                            {favorites.length > 9 ? "9+" : favorites.length}
                        </span>
                    )}
                </div>
                {isMobile && <span className="text-[10px]">{item.label}</span>}
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
                            <AppSidebar />
                        </div>
                    </div>
                </header>
            );
        }

        if (mode === "footer") {
            return (
                <nav className="bg-background/90 backdrop-blur-md border-t border-border/50 shrink-0 z-50 w-full overflow-hidden touch-none select-none">
                    <div className="pb-[env(safe-area-inset-bottom)]">
                        <div className="flex items-center justify-around h-16 w-full">
                            {navItems.map((item) => renderNavItem(item))}
                        </div>
                    </div>
                </nav>
            );
        }

        return null;
    }

    // 桌面版渲染邏輯 (改為結構化佈局，移除 fixed 定位以避免偏移)
    return (
        <nav className="w-16 bg-background border-r border-border/50 flex flex-col items-center shrink-0 h-full py-4 z-50">
            {/* Logo 區域 */}
            <div className="mb-4">
                <div className="p-2 bg-primary/10 rounded-xl">
                    <School className="h-5 w-5 text-primary" />
                </div>
            </div>

            {/* 功能項區域 */}
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
                {navItems.map((item) => renderNavItem(item))}
            </div>

            {/* 側邊欄腳部選單 */}
            <div className="mt-auto">
                <AppSidebar />
            </div>
        </nav>
    );
}
