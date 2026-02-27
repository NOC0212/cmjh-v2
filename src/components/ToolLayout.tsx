import React, { useState } from "react";
import { ArrowLeft, Menu, X, Target, Users, Shuffle, Clock as ClockIcon, Timer as TimerIcon, QrCode, Pencil, ClipboardCheck } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tools = [
    { id: "wheel", icon: Target, title: "抽籤", path: "/tools/wheel", color: "text-blue-500" },
    { id: "grouping", icon: Users, title: "分組", path: "/tools/grouping", color: "text-green-500" },
    { id: "order", icon: Shuffle, title: "順序", path: "/tools/order", color: "text-purple-500" },
    { id: "clock", icon: ClockIcon, title: "時鐘", path: "/tools/clock", color: "text-orange-500" },
    { id: "timer", icon: TimerIcon, title: "計時器", path: "/tools/timer", color: "text-red-500" },
    { id: "qrcode", icon: QrCode, title: "QR Code", path: "/tools/qrcode", color: "text-slate-500" },
    { id: "whiteboard", icon: Pencil, title: "白板", path: "/tools/whiteboard", color: "text-sky-500" },
    { id: "attendance", icon: ClipboardCheck, title: "點名", path: "/tools/attendance", color: "text-indigo-500" },
];

interface ToolLayoutProps {
    children: React.ReactNode;
    title: string;
    onBack?: () => void;
}

export function ToolLayout({ children, title, onBack }: ToolLayoutProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const currentPath = location.pathname;

    const handleBack = () => {
        if (onBack) {
            onBack();
            return;
        }
        navigate("/");
        setTimeout(() => {
            const toolsSection = document.getElementById("tools");
            if (toolsSection) {
                toolsSection.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }, 100);
    };

    const handleToolNav = (path: string) => {
        setMenuOpen(false);
        navigate(path);
    };

    return (
        <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
            {/* 導覽列 */}
            <header className="flex-none sticky top-0 z-40 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-primary/20">
                <div className="flex h-14 items-center gap-2 px-3 lg:px-4">
                    {/* 返回按鈕 */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBack}
                        className="shrink-0 h-8 w-8"
                        title="返回首頁"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>

                    {/* 標題 */}
                    <h1 className="text-sm sm:text-base font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent shrink-0">
                        {title}
                    </h1>

                    {/* 分隔線（桌面版） */}
                    <div className="hidden md:block h-5 w-px bg-border mx-1 shrink-0" />

                    {/* 桌面版：工具快速切換 */}
                    <nav className="hidden md:flex items-center gap-0.5 flex-1 overflow-x-auto scrollbar-hide">
                        {tools.map((tool) => {
                            const Icon = tool.icon;
                            const isActive = currentPath === tool.path;
                            return (
                                <button
                                    key={tool.id}
                                    onClick={() => handleToolNav(tool.path)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                    )}
                                >
                                    <Icon className={cn("h-3.5 w-3.5", isActive ? "text-primary" : tool.color)} />
                                    {tool.title}
                                </button>
                            );
                        })}
                    </nav>

                    {/* 間距撐開（手機版） */}
                    <div className="flex-1 md:hidden" />

                    {/* 手機版：漢堡選單按鈕 */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden shrink-0 h-8 w-8"
                        aria-label="切換工具選單"
                    >
                        {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </Button>
                </div>

                {/* 手機版摺疊選單 */}
                {menuOpen && (
                    <div className="md:hidden border-t border-border/50 bg-background/95 px-3 py-2">
                        <div className="grid grid-cols-4 gap-1.5">
                            {tools.map((tool) => {
                                const Icon = tool.icon;
                                const isActive = currentPath === tool.path;
                                return (
                                    <button
                                        key={tool.id}
                                        onClick={() => handleToolNav(tool.path)}
                                        className={cn(
                                            "flex flex-col items-center gap-1 px-1 py-2 rounded-xl text-[10px] font-medium transition-all",
                                            isActive
                                                ? "bg-primary/10 text-primary"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                        )}
                                    >
                                        <Icon className={cn("h-5 w-5", isActive ? "text-primary" : tool.color)} />
                                        {tool.title}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </header>

            {/* 內容區 */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8">
                <div className="max-w-7xl w-full mx-auto">
                    {children}
                </div>

                {/* Footer */}
                <footer className="mt-12 border-t border-primary/20 bg-gradient-to-r from-background to-primary/5 py-6 px-4 lg:px-6 rounded-t-3xl">
                    <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
                        <p>© 2026 崇明國中 by cy.noc0531</p>
                    </div>
                </footer>
            </main>
        </div>
    );
}
