import { useState, useEffect } from "react";
import { RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentVersion, LATEST_VERSION } from "@/lib/app-version";

export function UpdatePrompt() {
    const [show, setShow] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const currentVersion = getCurrentVersion();

    useEffect(() => {
        if (currentVersion && currentVersion !== LATEST_VERSION) {
            setShow(true);
        }

        const handleShowUpdate = () => setShow(true);
        window.addEventListener("show-update-prompt", handleShowUpdate);
        return () => window.removeEventListener("show-update-prompt", handleShowUpdate);
    }, [currentVersion]);

    const handleUpdate = () => {
        localStorage.clear();
        window.location.reload();
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300 text-foreground">
            <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {!isConfirming ? (
                    <>
                        <div className="bg-primary/10 p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/20 rounded-lg text-primary">
                                    <RefreshCw className="h-6 w-6 animate-spin-slow" />
                                </div>
                                <h2 className="text-xl font-bold text-foreground">發現新版本</h2>
                            </div>
                            <button
                                onClick={() => setShow(false)}
                                className="p-1 hover:bg-primary/20 rounded-full transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <p className="text-sm text-foreground/80 leading-relaxed">
                                    崇明國中-v2 已有新版本發佈！為了確保功能的穩定性與最新體驗，建議您立即更新。
                                </p>
                                <div className="flex items-center gap-2 text-xs font-mono bg-muted p-2 rounded-md">
                                    <span className="text-muted-foreground">目前: {currentVersion}</span>
                                    <span className="text-primary-foreground bg-primary px-1 rounded">→</span>
                                    <span className="text-primary font-bold">最新: {LATEST_VERSION}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-bold flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    更新內容
                                </h3>
                                <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-2 max-h-[120px] overflow-y-auto custom-scrollbar">
                                    <div className="flex gap-2">
                                        <span className="text-primary">✨</span>
                                        <p className="text-foreground/90"><span className="font-bold text-foreground">佈景主題修復及重作</span>：解決刷新頁面時主題重置的問題，並且對主題系統進行重做</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-primary">🛠️</span>
                                        <p className="text-foreground/90"><span className="font-bold text-foreground">全域設定管理</span>：優化內部儲存機制與組件管理流程，大幅提升系統穩定性。</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-primary">🚀</span>
                                        <p className="text-foreground/90"><span className="font-bold text-foreground">效能優化</span>：提升頁面切換與資源載入效率，提供更流暢的使用體驗。</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-primary">🎨</span>
                                        <p className="text-foreground/90"><span className="font-bold text-foreground">UI/UX 優化</span>：精緻化彈窗圓角與排版結構，並優化手機版的顯示效果。</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">

                                <p className="text-xs text-destructive font-medium leading-relaxed">
                                    * 注意：更新將會重置所有本地設定（如自訂網站、計時器、行事曆等）。如果您有重要資料，請先關閉此視窗至「設定」中下載備份。
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                <Button
                                    className="flex-1 h-11 gap-2 text-base font-semibold"
                                    onClick={() => setIsConfirming(true)}
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    立即更新
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 h-11 text-base font-medium"
                                    onClick={() => setShow(false)}
                                >
                                    稍後再說
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="p-8 space-y-6 text-center animate-in slide-in-from-right-4 duration-300">
                        <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center text-destructive mb-2">
                            <RefreshCw className="h-8 w-8 animate-spin" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold text-foreground">確定要執行更新嗎？</h2>
                            <p className="text-sm text-muted-foreground">
                                此動作無法復原。更新後，您的所有個人設定將會被清空並恢復至預設狀態。
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button
                                variant="destructive"
                                className="h-12 text-base font-bold"
                                onClick={handleUpdate}
                            >
                                我了解風險，確認更新
                            </Button>
                            <Button
                                variant="ghost"
                                className="h-11 text-sm text-muted-foreground hover:text-foreground"
                                onClick={() => setIsConfirming(false)}
                            >
                                返回上一步
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
