import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Megaphone, Calendar } from "lucide-react";
import { useSettings } from "@/hooks/SettingsContext";
import { getCurrentVersion, LATEST_VERSION } from "@/lib/app-version";

interface SiteAnnouncement {
    id: string;
    title: string;
    date: string;
    type?: string;
    pinned?: boolean;
    content?: string;
}

const READ_ANNOUNCEMENTS_KEY = "cmjh-read-announcements";

export function LatestAnnouncementModal() {
    const { settings } = useSettings();
    const [isOpen, setIsOpen] = useState(false);
    
    // 支援多個公告
    const [unreadAnns, setUnreadAnns] = useState<SiteAnnouncement[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // 使用 ref 追蹤 disableUpdatePrompt，避免其變化觸發 useEffect 重新執行
    const disableUpdatePromptRef = useRef(settings.disableUpdatePrompt);
    useEffect(() => {
        disableUpdatePromptRef.current = settings.disableUpdatePrompt;
    }, [settings.disableUpdatePrompt]);

    useEffect(() => {
        if (!settings.showLatestAnnouncementOnStartup) return;

        // 如果在這個 session 中已經檢查過並顯示過公告，就不要再顯示了
        const hasCheckedInSession = sessionStorage.getItem("cmjh-announcement-checked");
        
        const checkLatestAnnouncement = async (isManualTrigger = false) => {
            // 自動觸發且本 session 已經檢查過的話，就不再執行
            if (!isManualTrigger && hasCheckedInSession === "true") return;

            // 如果偵測到有新版本需要更新且更新提醒未關閉，且「尚未」被使用者手動關閉，則不顯示公告
            const currentVersion = getCurrentVersion();
            const isDismissedInSession = sessionStorage.getItem("cmjh-update-dismissed") === "true";
            
            if (currentVersion && currentVersion !== LATEST_VERSION && !disableUpdatePromptRef.current && !isDismissedInSession && !isManualTrigger) {
                return;
            }

            try {
                const res = await fetch("/data/site-announcements.json");
                const data: SiteAnnouncement[] = await res.json();
                
                if (data && data.length > 0) {
                    const sortedData = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    const now = new Date();
                    const readStr = localStorage.getItem(READ_ANNOUNCEMENTS_KEY);
                    const readList: string[] = readStr ? JSON.parse(readStr) : [];
                    
                    // 過濾出 7 天內且未讀的公告
                    const recentUnread = sortedData.filter(ann => {
                        const annDate = new Date(ann.date);
                        const diffTime = Math.abs(now.getTime() - annDate.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays <= 7 && !readList.includes(ann.id);
                    });
                    
                    if (recentUnread.length > 0) {
                        setUnreadAnns(recentUnread);
                        setCurrentIndex(0);
                        // 標記本 session 已經檢查過，避免切換頁面回來又彈出
                        sessionStorage.setItem("cmjh-announcement-checked", "true");
                        
                        // 如果是手動觸發（Dismiss 後），不延遲直接顯示
                        if (isManualTrigger) {
                            setIsOpen(true);
                        } else {
                            setTimeout(() => setIsOpen(true), 800);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch latest announcement:", error);
            }
        };

        checkLatestAnnouncement();

        const handleUpdateClosed = () => {
            sessionStorage.setItem("cmjh-update-dismissed", "true");
            checkLatestAnnouncement(true);
        };

        // 監聽更新提醒關閉事件
        window.addEventListener("update-prompt-closed", handleUpdateClosed);
        return () => window.removeEventListener("update-prompt-closed", handleUpdateClosed);
    }, [settings.showLatestAnnouncementOnStartup]);

    const handleClose = () => {
        if (currentIndex < unreadAnns.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setIsOpen(false);
        }
    };

    const handleNeverShow = () => {
        const currentAnn = unreadAnns[currentIndex];
        if (currentAnn) {
            const readStr = localStorage.getItem(READ_ANNOUNCEMENTS_KEY);
            const readList: string[] = readStr ? JSON.parse(readStr) : [];
            if (!readList.includes(currentAnn.id)) {
                readList.push(currentAnn.id);
                localStorage.setItem(READ_ANNOUNCEMENTS_KEY, JSON.stringify(readList));
            }
        }
        handleClose();
    };

    const currentAnn = unreadAnns[currentIndex];
    if (!currentAnn) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px] w-[92vw] p-0 overflow-hidden border-border/50 bg-background shadow-2xl rounded-2xl outline-none">
                {/* 隱藏預設 Title 以滿足無障礙需求，但我們在畫面中有自己渲染的標題 */}
                <DialogTitle className="sr-only">最新公告</DialogTitle>
                
                <div className="relative p-6 sm:p-8 flex flex-col items-center text-center">
                    {/* Icon 區域 */}
                    <div className="relative mb-6 mt-2">
                        <div className="relative h-16 w-16 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-sm">
                            <Megaphone className="h-8 w-8 text-primary" />
                        </div>
                        {/* 浮動標籤 */}
                        <div className="absolute -top-3 -right-3 bg-destructive text-destructive-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md animate-bounce">
                            NEW
                        </div>
                    </div>

                    {/* 標題與日期 */}
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-3 text-foreground leading-snug flex justify-center items-center gap-2 flex-wrap">
                        {currentAnn.title}
                        {unreadAnns.length > 1 && (
                            <span className="text-sm font-normal text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full whitespace-nowrap">
                                {currentIndex + 1} / {unreadAnns.length}
                            </span>
                        )}
                    </h2>
                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full mb-6 border border-primary/20">
                        <Calendar className="h-3.5 w-3.5" />
                        {currentAnn.date}
                    </div>

                    {/* 內容區塊 */}
                    {currentAnn.content && (
                        <div className="w-full text-left text-sm text-foreground/80 leading-relaxed bg-muted/40 p-5 rounded-xl border border-border/50 shadow-inner mb-8 max-h-[35vh] overflow-y-auto">
                            <div className="whitespace-pre-wrap">{currentAnn.content}</div>
                        </div>
                    )}

                    {/* 按鈕操作區 */}
                    <div className="w-full flex flex-col gap-3 mt-auto">
                        <Button 
                            onClick={handleClose} 
                            className="w-full rounded-lg py-6 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {currentIndex < unreadAnns.length - 1 ? "下一則" : "我知道了"}
                        </Button>
                        <button 
                            onClick={handleNeverShow}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline py-2"
                        >
                            {currentIndex < unreadAnns.length - 1 ? "已讀此訊息，並前往下一則" : "已讀此訊息，近期內不再顯示"}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
