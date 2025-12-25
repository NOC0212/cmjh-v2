import { useState, useEffect } from "react";
import { Megaphone } from "lucide-react";

interface SiteAnnouncement {
    id: string;
    title: string;
    date: string;
}

export function SiteAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<SiteAnnouncement[]>([]);
    const [loading, setLoading] = useState(true);

    // 獲取站內公告數據
    useEffect(() => {
        fetch("/data/site-announcements.json")
            .then((res) => res.json())
            .then((data) => {
                setAnnouncements(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);

    return (
        <div className="space-y-6 text-foreground">
            {/* 頁面標題列 */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Megaphone className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold">本站公告</h2>
            </div>

            {/* 公告列表區域 */}
            <div className="space-y-3">
                {loading ? (
                    <div className="text-center text-muted-foreground py-8">
                        載入中...
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        目前沒有公告
                    </div>
                ) : (
                    announcements.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all"
                        >
                            <Megaphone className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium">
                                    {item.title}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    {item.date}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
