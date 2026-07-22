import React, { useState } from "react";
import { ArrowLeft, Menu, X, Target, Users, Shuffle, Clock as ClockIcon, Timer as TimerIcon, QrCode, Pencil, ClipboardCheck } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/SettingsContext";
import { getPageBackgroundStyle } from "@/lib/page-background";

const tools = [
    { id: "wheel", icon: Target, title: "抽籤", path: "/tools/wheel" },
    { id: "grouping", icon: Users, title: "分組", path: "/tools/grouping" },
    { id: "order", icon: Shuffle, title: "順序", path: "/tools/order" },
    { id: "clock", icon: ClockIcon, title: "時鐘", path: "/tools/clock" },
    { id: "timer", icon: TimerIcon, title: "計時器", path: "/tools/timer" },
    { id: "qrcode", icon: QrCode, title: "QR Code", path: "/tools/qrcode" },
    { id: "whiteboard", icon: Pencil, title: "白板", path: "/tools/whiteboard" },
    { id: "attendance", icon: ClipboardCheck, title: "點名", path: "/tools/attendance" },
];

interface ToolLayoutProps {
    children: React.ReactNode;
    title: string;
    onBack?: () => void;
}

export function ToolLayout({ children, title, onBack }: ToolLayoutProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { settings } = useSettings();
    const [menuOpen, setMenuOpen] = useState(false);

    const currentPath = location.pathname;

    const handleBack = () => {
        if (onBack) {
            onBack();
            return;
        }
        navigate("/app");
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
        <div className="h-screen w-full flex flex-col overflow-hidden" style={getPageBackgroundStyle(settings.pageBackground, settings.pageBackgroundImage)}>
            <header className="flex-none sticky top-0 z-40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-14 items-center gap-1.5 px-2 lg:px-4 border-b border-primary/10">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBack}
                        className="shrink-0 h-9 w-9 rounded-xl hover:bg-primary/10"
                        title="返回首頁"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>

                    <h1 className="text-sm sm:text-base font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent shrink-0 mr-2">
                        {title}
                    </h1>

                    <div className="hidden md:block h-5 w-px bg-border/50 mx-1 shrink-0" />

                    <nav className="hidden md:flex items-center gap-0.5 flex-1 overflow-x-auto scrollbar-hide">
                        {tools.map((tool) => {
                            const Icon = tool.icon;
                            const isActive = currentPath === tool.path;
                            return (
                                <button
                                    key={tool.id}
                                    onClick={() => handleToolNav(tool.path)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap shrink-0",
                                        isActive
                                            ? "bg-primary/10 text-primary shadow-sm"
                                            : "text-muted-foreground/70 hover:text-foreground hover:bg-muted/50"
                                    )}
                                >
                                    <Icon className={cn("h-3.5 w-3.5 transition-transform duration-200", isActive && "scale-110")} />
                                    {tool.title}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="flex-1 md:hidden" />

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden shrink-0 h-9 w-9 rounded-xl hover:bg-primary/10"
                        aria-label="切換工具選單"
                    >
                        {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </Button>
                </div>

                <div className={cn(
                    "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
                    menuOpen ? "max-h-96 border-t border-border/40" : "max-h-0"
                )}>
                    <div className="bg-background/95 backdrop-blur-xl px-3 py-3">
                        <div className="grid grid-cols-4 gap-2">
                            {tools.map((tool) => {
                                const Icon = tool.icon;
                                const isActive = currentPath === tool.path;
                                return (
                                    <button
                                        key={tool.id}
                                        onClick={() => handleToolNav(tool.path)}
                                        className={cn(
                                            "flex flex-col items-center gap-1.5 px-1 py-2.5 rounded-2xl text-[10px] font-medium transition-all duration-200",
                                            isActive
                                                ? "bg-primary/10 text-primary shadow-sm scale-105"
                                                : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 active:scale-95"
                                        )}
                                    >
                                        <Icon className={cn(
                                            "h-5 w-5 transition-transform duration-200",
                                            isActive && "scale-110"
                                        )} />
                                        {tool.title}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-8 flex flex-col">
                <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col lg:justify-center">
                    {children}
                </div>

                <footer className="mt-12 border-t border-primary/10 bg-gradient-to-r from-background to-primary/[0.02] py-6 px-4 lg:px-6 rounded-t-3xl">
                    <div className="max-w-7xl mx-auto text-center text-xs text-muted-foreground/60">
                        <p>© 2026 崇明國中 by cy.noc0531</p>
                    </div>
                </footer>
            </main>
        </div>
    );
}
