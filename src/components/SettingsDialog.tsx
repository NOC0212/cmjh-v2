import { useState } from "react";
import { Settings } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useComponentSettings } from "@/hooks/useComponentSettings";

const COMPONENT_LABELS = {
    countdown: "倒數計時器",
    weather: "天氣資訊",
    commonSites: "常用網站",
    announcements: "行政公告",
    calendar: "行事曆",
};

export function SettingsDialog() {
    const [open, setOpen] = useState(false);
    const { visibility, updateVisibility, resetToDefault, showAll } = useComponentSettings();

    const handleCheckboxChange = (key: keyof typeof visibility, checked: boolean) => {
        updateVisibility(key, checked);
    };

    const handleShowAll = () => {
        showAll();
    };

    const handleReset = () => {
        resetToDefault();
    };

    const handleComplete = () => {
        setOpen(false);
        // 短暫延遲後刷新頁面，讓對話框有時間關閉
        setTimeout(() => {
            window.location.reload();
        }, 100);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">設定</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>組件顯示設定</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground">
                        選擇要在首頁顯示的組件
                    </p>
                    <div className="space-y-3">
                        {Object.entries(COMPONENT_LABELS).map(([key, label]) => (
                            <div key={key} className="flex items-center space-x-2">
                                <Checkbox
                                    id={key}
                                    checked={visibility[key as keyof typeof visibility]}
                                    onCheckedChange={(checked) =>
                                        handleCheckboxChange(key as keyof typeof visibility, checked === true)
                                    }
                                />
                                <Label
                                    htmlFor={key}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                    {label}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
                <DialogFooter className="flex flex-row gap-2 sm:justify-between">
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleShowAll}>
                            全選
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleReset}>
                            重置
                        </Button>
                    </div>
                    <Button size="sm" onClick={handleComplete}>
                        完成
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
