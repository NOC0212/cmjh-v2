import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Megaphone, BellRing } from "lucide-react";
import { useSettings } from "@/hooks/SettingsContext";
import { getCurrentVersion, LATEST_VERSION, STORAGE_KEYS } from "@/lib/app-version";

interface SiteAnnouncement {
  id: string;
  title: string;
  date: string;
  type?: string;
  pinned?: boolean;
  content?: string;
}

const READ_ANNOUNCEMENTS_KEY = STORAGE_KEYS.READ_ANNOUNCEMENTS;

let hasCheckedInSession = false;
let isUpdateDismissedInSession = false;

export function LatestAnnouncementModal() {
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadAnns, setUnreadAnns] = useState<SiteAnnouncement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const disableUpdatePromptRef = useRef(settings.disableUpdatePrompt);
  useEffect(() => {
    disableUpdatePromptRef.current = settings.disableUpdatePrompt;
  }, [settings.disableUpdatePrompt]);

  useEffect(() => {
    if (!settings.showLatestAnnouncementOnStartup) return;

    const checkLatestAnnouncement = async (isManualTrigger = false) => {
      if (!isManualTrigger && hasCheckedInSession) return;

      const currentVersion = getCurrentVersion();
      if (
        currentVersion &&
        currentVersion !== LATEST_VERSION &&
        !disableUpdatePromptRef.current &&
        !isUpdateDismissedInSession &&
        !isManualTrigger
      ) {
        return;
      }

      try {
        const res = await fetch("/data/site-announcements.json");
        const data: SiteAnnouncement[] = await res.json();
        if (!data?.length) return;

        const sortedData = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const now = new Date();
        const readStr = localStorage.getItem(READ_ANNOUNCEMENTS_KEY);
        const readList: string[] = readStr ? JSON.parse(readStr) : [];

        const recentUnread = sortedData.filter((ann) => {
          const annDate = new Date(ann.date);
          const diffTime = Math.abs(now.getTime() - annDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 7 && !readList.includes(ann.id);
        });

        if (!recentUnread.length) return;

        setUnreadAnns(recentUnread);
        setCurrentIndex(0);
        hasCheckedInSession = true;

        if (isManualTrigger) {
          setIsOpen(true);
        } else {
          setTimeout(() => setIsOpen(true), 800);
        }
      } catch (error) {
        console.error("Failed to fetch latest announcement:", error);
      }
    };

    checkLatestAnnouncement();

    const handleUpdateClosed = () => {
      isUpdateDismissedInSession = true;
      checkLatestAnnouncement(true);
    };

    window.addEventListener("update-prompt-closed", handleUpdateClosed);
    return () => window.removeEventListener("update-prompt-closed", handleUpdateClosed);
  }, [settings.showLatestAnnouncementOnStartup]);

  const handleNextOrClose = () => {
    if (currentIndex < unreadAnns.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }
    setIsOpen(false);
  };

  const markCurrentAsRead = () => {
    const currentAnn = unreadAnns[currentIndex];
    if (!currentAnn) return;

    const readStr = localStorage.getItem(READ_ANNOUNCEMENTS_KEY);
    const readList: string[] = readStr ? JSON.parse(readStr) : [];
    if (!readList.includes(currentAnn.id)) {
      readList.push(currentAnn.id);
      localStorage.setItem(READ_ANNOUNCEMENTS_KEY, JSON.stringify(readList));
    }
    handleNextOrClose();
  };

  const currentAnn = unreadAnns[currentIndex];
  if (!currentAnn) return null;

  const hasMore = currentIndex < unreadAnns.length - 1;

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          markCurrentAsRead();
        }
        setIsOpen(open);
      }}
    >
      <DialogContent className="w-[92vw] max-w-xl overflow-hidden rounded-3xl border-border bg-card p-0 shadow-2xl outline-none [&>button]:right-5 [&>button]:top-5 [&>button]:flex [&>button]:h-8 [&>button]:w-8 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:bg-black/30 [&>button]:text-white [&>button]:backdrop-blur-md hover:[&>button]:bg-black/50 focus:[&>button]:ring-0 transition-all duration-300">
        <DialogTitle className="sr-only">站內公告通知</DialogTitle>

        {/* 16:9 Header Image */}
        <div className="relative aspect-video w-full overflow-hidden">
          <img 
            src="/announcement.png" 
            alt="Announcement Header" 
            className="h-full w-full object-cover"
          />
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold leading-tight text-foreground">{currentAnn.title}</h3>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {currentAnn.date}
                </div>
              </div>
            </div>
            
            {unreadAnns.length > 1 && (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                {currentIndex + 1} / {unreadAnns.length}
              </span>
            )}
          </div>

          <div className="max-h-[35vh] overflow-y-auto pr-2 custom-scrollbar">
            {currentAnn.content ? (
              <div className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
                {currentAnn.content}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground">
                <BellRing className="mx-auto mb-3 h-8 w-8 opacity-20" />
                <p>這則公告沒有附加詳細內容。</p>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button 
              className="h-12 flex-[2] rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" 
              onClick={handleNextOrClose}
            >
              {hasMore ? "下一則公告" : "不再顯示"}
            </Button>
            {hasMore ? (
              <Button 
                variant="outline" 
                className="h-12 flex-1 rounded-2xl font-semibold" 
                onClick={markCurrentAsRead}
              >
                略過此通知
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
