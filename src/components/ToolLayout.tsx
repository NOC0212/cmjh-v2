import { useState } from "react";
import { ArrowLeft, Sun, Moon, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/AppSidebar";

interface ToolLayoutProps {
    children: React.ReactNode;
    title: string;
}

export function ToolLayout({ children, title }: ToolLayoutProps) {
    const navigate = useNavigate();
    const [theme, setTheme] = useState<"light" | "dark">("light");

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);

        // 應用主題
        const root = document.documentElement;
        const body = document.body;

        if (newTheme === "dark") {
            root.classList.add("dark");
            body.classList.add("dark");
        } else {
            root.classList.remove("dark");
            body.classList.remove("dark");
        }
    };

    return (
        <div className="min-h-screen flex w-full bg-background">
            <div className="flex-1 flex flex-col">
                {/* 導覽列 */}
                <header className="sticky top-0 z-40 bg-gradient-to-r from-background via-background to-primary/5 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-primary/20">
                    <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
                        {/* 返回按鈕 */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate("/")}
                            className="mr-2"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>

                        {/* 標題 */}
                        <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent flex-1">
                            {title}
                        </h1>

                        {/* 右側按鈕 */}
                        <div className="flex items-center gap-2">
                            {/* 主題切換 */}
                            <Button variant="ghost" size="icon" onClick={toggleTheme}>
                                {theme === "light" ? (
                                    <Moon className="h-5 w-5" />
                                ) : (
                                    <Sun className="h-5 w-5" />
                                )}
                            </Button>

                            {/* 選單 */}
                            <AppSidebar />
                        </div>
                    </div>
                </header>

                {/* 內容區 */}
                <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
                    {children}
                </main>

                {/* Footer */}
                <footer className="border-t border-primary/20 bg-gradient-to-r from-background to-primary/5 py-6 px-4 lg:px-6">
                    <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
                        <p>© 2025 崇明國中 by nocfond</p>
                    </div>
                </footer>
            </div>
        </div>
    );
}
