import { Settings, ChevronUp, ChevronDown, Sun, Moon, Palette, RefreshCw, Download, Upload, Monitor, GripVertical, SunMoon, ListChecks, List, Zap, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useSettings } from "@/hooks/SettingsContext";
import { getCurrentVersion, LATEST_VERSION, exportUserData, importUserData } from "@/lib/app-version";
import { useToast } from "@/hooks/use-toast";
import { useRef, useState } from "react";
import { Reorder } from "framer-motion";

// 主題模式定義
const MODES = [
    { name: "淺色", value: "light", icon: Sun },
    { name: "深色", value: "dark", icon: Moon },
    { name: "跟隨系統", value: "system", icon: Monitor },
];

// 主題顏色定義
const COLORS = [
    { name: "藍色", value: "blue", color: "#3b82f6" },
    { name: "紅色", value: "red", color: "#ef4444" },
    { name: "綠色", value: "green", color: "#10b981" },
    { name: "橙色", value: "orange", color: "#f59e0b" },
    { name: "紫色", value: "purple", color: "#8b5cf6" },
    { name: "霓虹", value: "neon", color: "#00f3ff" },
    { name: "現代漸層", value: "modern", color: "linear-gradient(135deg, #fbbf24, #f97316)" },
    { name: "主題漸層", value: "gradient", color: "linear-gradient(135deg, #3b82f6, #8b5cf6, #ef4444)" },
];

export function SettingsPage() {

    const { settings, toggleComponent, moveComponentUp, moveComponentDown, setThemeMode, setThemeColor, setDisableUpdatePrompt, setShowLatestAnnouncementOnStartup, setShowSiteFavicons, resetToDefault, showAll, reorderComponents } =
        useSettings();

    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isConfirmingUpdate, setIsConfirmingUpdate] = useState(false);

    const currentVersion = getCurrentVersion();
    const canUpdate = currentVersion !== LATEST_VERSION;

    // 切換組件可見性
    const handleCheckboxChange = (id: string) => {
        toggleComponent(id);
    };

    // 啟用所有組件
    const handleShowAll = () => {
        showAll();
    };

    // 重置所有設定至預設狀態
    const handleReset = () => {
        resetToDefault();
    };

    // 重新載入頁面以套用設定
    const handleComplete = () => {
        setTimeout(() => {
            window.location.reload();
        }, 100);
    };

    const handleUpdate = () => {
        if (!canUpdate) return;
        window.dispatchEvent(new CustomEvent("show-update-prompt"));
    };

    const confirmUpdate = () => {
        localStorage.clear();
        window.location.reload();
    };

    const handleExport = () => {
        exportUserData();
        toast({
            title: "導出成功",
            description: "設定檔已準備好下載",
        });
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                importUserData(json);
                toast({
                    title: "匯入成功",
                    description: "設定已套用，即將重新載入頁面",
                });
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } catch (err) {
                toast({
                    title: "匯入失敗",
                    description: "請確保檔案格式正確",
                    variant: "destructive",
                });
            }
        };
        reader.readAsText(file);
    };

    // 取得分類後的組件清單
    const enabledComponents = settings.components
        .filter((c) => c.enabled)
        .sort((a, b) => a.order - b.order);

    const disabledComponents = settings.components.filter((c) => !c.enabled);

    return (
        <div className="space-y-6 pb-8 text-foreground">
            {/* 頁面標題列 */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Settings className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold">設定</h2>
            </div>

            <div className="space-y-6">
                {/* 啟用的組件管理 */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h3 className="text-sm font-semibold flex items-center gap-2">
                                <ListChecks className="h-4 w-4 text-primary" />
                                已啟用的組件
                            </h3>
                            <p className="text-xs text-muted-foreground">拖曳或使用按鈕調整組件順序</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleShowAll} className="text-foreground">
                                全選
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleReset} className="text-foreground">
                                重置
                            </Button>
                            <Button size="sm" onClick={handleComplete}>
                                套用
                            </Button>
                        </div>
                    </div>
                    <Reorder.Group
                        axis="y"
                        values={enabledComponents}
                        onReorder={reorderComponents}
                        className="space-y-2 bg-muted/30 rounded-lg p-3"
                    >
                        {enabledComponents.length > 0 ? (
                            enabledComponents.map((component, index) => (
                                <Reorder.Item
                                    key={component.id}
                                    value={component}
                                    className="flex items-center gap-2 bg-background rounded-md p-2 border border-border shadow-sm active:shadow-md transition-shadow"
                                >
                                    <div className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-primary transition-colors">
                                        <GripVertical className="h-4 w-4" />
                                    </div>
                                    <Checkbox
                                        id={`enabled-${component.id}`}
                                        checked={true}
                                        onCheckedChange={() => handleCheckboxChange(component.id)}
                                    />
                                    <Label htmlFor={`enabled-${component.id}`} className="flex-1 text-sm font-medium cursor-pointer">
                                        {component.label}
                                    </Label>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-foreground"
                                            onClick={() => moveComponentUp(component.id)}
                                            disabled={index === 0}
                                        >
                                            <ChevronUp className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-foreground"
                                            onClick={() => moveComponentDown(component.id)}
                                            disabled={index === enabledComponents.length - 1}
                                        >
                                            <ChevronDown className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </Reorder.Item>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">目前沒有啟用的組件</p>
                        )}
                    </Reorder.Group>
                </div>

                <Separator />

                {/* 未啟用的組件管理 */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                        <List className="h-4 w-4 text-muted-foreground" />
                        未啟用的組件
                    </h3>
                    <div className="space-y-2">
                        {disabledComponents.length > 0 ? (
                            disabledComponents.map((component) => (
                                <div key={component.id} className="flex items-center gap-2 p-2">
                                    <Checkbox
                                        id={`disabled-${component.id}`}
                                        checked={false}
                                        onCheckedChange={() => handleCheckboxChange(component.id)}
                                    />
                                    <Label
                                        htmlFor={`disabled-${component.id}`}
                                        className="text-sm font-medium cursor-pointer text-muted-foreground"
                                    >
                                        {component.label}
                                    </Label>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-2">所有組件均已啟用</p>
                        )}
                    </div>
                </div>

                <Separator />

                {/* 主題模式 */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                        <SunMoon className="h-4 w-4" />
                        主題模式
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                        {MODES.map((mode) => {
                            const Icon = mode.icon;
                            const isActive = settings.themeMode === mode.value;
                            return (
                                <Button
                                    key={mode.value}
                                    variant={isActive ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setThemeMode(mode.value as any)}
                                    className="gap-2"
                                >
                                    <Icon className="h-4 w-4" />
                                    <span className="text-xs">{mode.name}</span>
                                </Button>
                            );
                        })}
                    </div>
                </div>

                <Separator />

                {/* 主題顏色 */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        顏色方案
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {COLORS.map((color) => {
                            const isActive = settings.themeColor === color.value;
                            return (
                                <Button
                                    key={color.value}
                                    variant={isActive ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setThemeColor(color.value)}
                                    className="justify-start gap-2 text-foreground data-[state=active]:text-background"
                                >
                                    <div className="relative">
                                        <Palette className="h-4 w-4" style={{ color: color.color.includes("linear-gradient") || isActive ? undefined : color.color }} />
                                        {color.color.includes("linear-gradient") && !isActive && (
                                            <div
                                                className="absolute inset-0 rounded-full"
                                                style={{ background: color.color, maskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'black\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Ccircle cx=\'13.5\' cy=\'6.5\' r=\'.5\' fill=\'black\'/%3E%3Ccircle cx=\'17.5\' cy=\'10.5\' r=\'.5\' fill=\'black\'/%3E%3Ccircle cx=\'8.5\' cy=\'7.5\' r=\'.5\' fill=\'black\'/%3E%3Ccircle cx=\'6.5\' cy=\'12.5\' r=\'.5\' fill=\'black\'/%3E%3Cpath d=\'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.5-.7 1.5-1.5 0-.4-.15-.74-.41-1.01-.25-.25-.4-.59-.4-1.01 0-.85.7-1.5 1.5-1.5h2.14c2.93 0 5.27-2.36 5.27-5.27 0-5.27-4.25-9.21-9.6-9.21Z\'/%3E%3C/svg%3E")', maskSize: 'contain', maskRepeat: 'no-repeat' }}
                                            />
                                        )}
                                    </div>
                                    <span>{color.name}</span>
                                    {isActive && <div className="ml-auto w-2 h-2 rounded-full bg-background" />}
                                </Button>
                            );
                        })}
                    </div>
                </div>

                <Separator />

                {/* 系統更新與資料管理 */}
                <div className="space-y-4">
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                            <Zap className="h-4 w-4 text-primary" />
                            系統更新
                        </h3>
                        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                            {!isConfirmingUpdate ? (
                                <>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-medium">版本資訊</p>
                                            <p className="text-xs text-muted-foreground">
                                                目前: <span className="font-mono">{currentVersion || "未知"}</span> | 最新: <span className="font-mono">{LATEST_VERSION}</span>
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant={canUpdate ? "default" : "outline"}
                                            className="gap-2"
                                            onClick={handleUpdate}
                                            disabled={!canUpdate}
                                        >
                                            <RefreshCw className={`h-4 w-4 ${canUpdate ? "animate-spin-slow" : ""}`} />
                                            {canUpdate ? "立即更新" : "已是最新版"}
                                        </Button>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="show-update-prompt" className="text-sm font-medium cursor-pointer">顯示版本更新提醒</Label>
                                            <p className="text-[10px] text-muted-foreground">開啟後，系統會主動提醒您有新版本可用</p>
                                        </div>
                                        <Checkbox
                                            id="show-update-prompt"
                                            checked={!settings.disableUpdatePrompt}
                                            onCheckedChange={(checked) => setDisableUpdatePrompt(!checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="disable-startup-announcement" className="text-sm font-medium cursor-pointer">進入網頁顯示最新公告</Label>
                                            <p className="text-[10px] text-muted-foreground">開啟後，若有7天內的新公告會在重新整理時自動彈出</p>
                                        </div>
                                        <Checkbox
                                            id="disable-startup-announcement"
                                            checked={settings.showLatestAnnouncementOnStartup}
                                            onCheckedChange={(checked) => setShowLatestAnnouncementOnStartup(!!checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="show-site-favicons" className="text-sm font-medium cursor-pointer">常用網站顯示網站圖標</Label>
                                            <p className="text-[10px] text-muted-foreground">開啟後，常用網站卡片會載入各網站的 favicon 圖示</p>
                                        </div>
                                        <Checkbox
                                            id="show-site-favicons"
                                            checked={settings.showSiteFavicons}
                                            onCheckedChange={(checked) => setShowSiteFavicons(!!checked)}
                                        />
                                    </div>
                                    {canUpdate && !settings.disableUpdatePrompt && (
                                        <p className="text-[10px] text-destructive">
                                            * 注意：更新將會重置所有本地設定，建議先進行備份。
                                        </p>
                                    )}
                                </>
                            ) : (
                                <div className="space-y-4 py-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-center gap-3 text-destructive">
                                        <RefreshCw className="h-5 w-5 animate-spin" />
                                        <p className="text-sm font-bold">確定要清除資料並更新嗎？</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        此動作會立即清空所有快取與自訂設定，完成後網頁會自動重新載入。
                                    </p>
                                    <div className="flex gap-2">
                                        <Button variant="destructive" size="sm" className="flex-1" onClick={confirmUpdate}>
                                            確認更新
                                        </Button>
                                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setIsConfirmingUpdate(false)}>
                                            取消
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                            <HardDrive className="h-4 w-4 text-primary" />
                            資料管理
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-muted/30 rounded-lg p-4 flex flex-col gap-3">
                                <div>
                                    <p className="text-sm font-medium">備份資料</p>
                                    <p className="text-xs text-muted-foreground">下載您目前所有的網站、計時器等個人設定。</p>
                                </div>
                                <Button variant="outline" size="sm" className="gap-2 mt-auto" onClick={handleExport}>
                                    <Download className="h-4 w-4" />
                                    下載已儲存的資料
                                </Button>
                            </div>
                            <div className="bg-muted/30 rounded-lg p-4 flex flex-col gap-3">
                                <div>
                                    <p className="text-sm font-medium">匯入設定</p>
                                    <p className="text-xs text-muted-foreground">將之前下載的備份檔重新套用到此網站。</p>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept=".json"
                                    className="hidden"
                                />
                                <Button variant="outline" size="sm" className="gap-2 mt-auto" onClick={handleImportClick}>
                                    <Upload className="h-4 w-4" />
                                    匯入並套用設定
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
