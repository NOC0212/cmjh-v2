import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ToolLayoutProps {
    children: React.ReactNode;
    title: string;
    onBack?: () => void;
}

export function ToolLayout({ children, title, onBack }: ToolLayoutProps) {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
            return;
        }
        navigate("/");
        // 等待導航完成後滾動到小工具區塊
        setTimeout(() => {
            const toolsSection = document.getElementById("tools");
            if (toolsSection) {
                toolsSection.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }, 100);
    };

    return (
        <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
            {/* 導覽列 */}
            <header className="flex-none sticky top-0 z-40 bg-gradient-to-r from-background via-background to-primary/5 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-primary/20">
                <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
                    {/* 返回按鈕 */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBack}
                        className="mr-2"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>

                    {/* 標題 */}
                    <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex-1">
                        {title}
                    </h1>

                    {/* 右側按鈕 */}
                    <div className="flex items-center gap-2">
                        {/* 選單已被移除 */}
                    </div>
                </div>
            </header>

            {/* 內容區 - 加入可捲動容器 */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8">
                <div className="max-w-7xl w-full mx-auto">
                    {children}
                </div>

                {/* Footer - 放在可捲動區域內以確保能看到 */}
                <footer className="mt-12 border-t border-primary/20 bg-gradient-to-r from-background to-primary/5 py-6 px-4 lg:px-6 rounded-t-3xl">
                    <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
                        <p>© 2026 崇明國中 by cy.noc0531</p>
                    </div>
                </footer>
            </main>
        </div>
    );
}
