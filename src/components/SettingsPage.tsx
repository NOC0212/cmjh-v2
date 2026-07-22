import {
    Settings,
    Sun,
    Moon,
    Palette,
    RefreshCw,
    Download,
    Upload,
    Monitor,
    GripVertical,
    List,
    Zap,
    HardDrive,
    ChevronLeft,
    Check,
    Image,
    Link2,
} from "lucide-react";
import { Reorder, motion, useDragControls, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useSettings, AppSettings, ComponentSettings } from "@/hooks/SettingsContext";
import { useToast } from "@/hooks/use-toast";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { getCurrentVersion, FALLBACK_VERSION, exportUserData, importUserData, isAdminUnlocked, unlockAdmin } from "@/lib/app-version";
import { cn } from "@/lib/utils";

const MODES = [
    { name: "淺色", value: "light", icon: Sun },
    { name: "深色", value: "dark", icon: Moon },
    { name: "跟隨系統", value: "system", icon: Monitor },
] as const;

const COLORS = [
    { name: "藍色", value: "blue", color: "linear-gradient(135deg, #DFF7FF, #7FCDFF)" },
    { name: "桃紅", value: "red", color: "linear-gradient(135deg, #FDFCFB, #D8BFD8)" },
    { name: "綠色", value: "green", color: "linear-gradient(135deg, #DFF6F0, #6DD5C4)" },
    { name: "霓虹", value: "neon", color: "#00f3ff" },
    { name: "極簡", value: "minimal", color: "linear-gradient(135deg, #000000 50%, #ffffff 50%)" },
    { name: "橘色", value: "modern", color: "linear-gradient(135deg, #FFB088, #FF7A50)" },
    { name: "漸層", value: "gradient", color: "linear-gradient(135deg, #E7D8FF, #B8C0FF)" },
];

const BUILTIN_BACKGROUND_OPTIONS = [
    { name: "預設", value: "default", color: "linear-gradient(135deg, hsl(var(--background)), hsl(var(--muted)))" },
    { name: "背景一", value: "preset-1", color: "linear-gradient(135deg, #1e3a8a, #7c3aed, #f59e0b)", previewImage: "/background-1.png" },
    { name: "背景二", value: "preset-2", color: "linear-gradient(135deg, #0f172a, #475569, #94a3b8)", previewImage: "/background-2.png" },
    { name: "圖片", value: "image", color: "linear-gradient(135deg, #334155, #64748b, #cbd5e1)" },
];

type Section = "layout" | "theme" | "background" | "preference" | "system" | null;

const fastTransition = { duration: 0.12, ease: "easeOut" as const };

export function SettingsPage() {
    const {
        settings,
        toggleComponent,
        setThemeMode,
        setThemeColor,
        setPageBackground,
        setPageBackgroundImage,
        setDisableUpdatePrompt,
        setShowLatestAnnouncementOnStartup,
        setShowSiteFavicons,
        setDisableDefaultCountdowns,
        resetToDefault,
        showAll,
        reorderComponents,
    } = useSettings();

    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const backgroundUploadRef = useRef<HTMLInputElement>(null);

    const [activeSection, setActiveSection] = useState<Section>(null);
    const [isResetConfirming, setIsResetConfirming] = useState(false);
    const [backgroundUrlInput, setBackgroundUrlInput] = useState(settings.pageBackgroundImage || "");

    const { appVersion } = useSiteConfig();
    const latestVersionFromServer = appVersion?.latestVersion || FALLBACK_VERSION;
    const currentVersion = getCurrentVersion();
    const canUpdate = currentVersion !== latestVersionFromServer;
    const disabledComponents = settings.components.filter((component) => !component.enabled);

    useEffect(() => {
        setBackgroundUrlInput(settings.pageBackgroundImage || "");
    }, [settings.pageBackgroundImage]);

    const handleReset = () => {
        resetToDefault();
        setIsResetConfirming(false);
        toast({ title: "已重置", description: "設定已恢復預設值" });
    };

    const handleComplete = () => {
        toast({ title: "已儲存", description: "設定已套用" });
    };

    const handleUpdate = () => {
        if (!canUpdate) return;
        window.dispatchEvent(new CustomEvent("show-update-prompt"));
    };

    const handleExport = () => {
        exportUserData();
        toast({ title: "匯出成功", description: "使用者資料已匯出" });
    };

    const handleImportClick = () => fileInputRef.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                importUserData(json);
                toast({ title: "匯入成功", description: "資料已匯入，稍後將重新整理頁面" });
                setTimeout(() => window.location.reload(), 1200);
            } catch {
                toast({ title: "匯入失敗", description: "檔案格式不正確", variant: "destructive" });
            }
        };
        reader.readAsText(file);
    };

    const handleBackgroundUrlApply = () => {
        const trimmed = backgroundUrlInput.trim();
        if (!trimmed) {
            setPageBackgroundImage("");
            setPageBackground("default");
            return;
        }

        setPageBackgroundImage(trimmed);
        setPageBackground("image");
    };

    const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = typeof event.target?.result === "string" ? event.target.result : "";
            if (!result) return;
            setBackgroundUrlInput(result);
            setPageBackgroundImage(result);
            setPageBackground("image");
        };
        reader.readAsDataURL(file);
    };

    const currentSectionTitle = {
        layout: "版面排序",
        theme: "主題外觀",
        background: "自訂背景",
        preference: "偏好設定",
        system: "系統資料",
    }[activeSection ?? "layout"];

    return (
        <div className="min-h-[500px] pb-8 text-foreground">
            <AnimatePresence mode="wait">
                {!activeSection ? (
                    <motion.div
                        key="menu"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={fastTransition}
                        className="space-y-6"
                    >
                        <div className="mb-8 flex items-center gap-4">
                            <div className="relative rounded-2xl bg-primary/10 p-2.5 shadow-sm">
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent opacity-50" />
                                <Settings className="relative h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">設定</h2>
                                <p className="text-xs text-muted-foreground">調整首頁內容、主題與個人偏好</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <MenuCard icon={GripVertical} title="版面排序" description="拖曳調整首頁元件顯示順序" color="blue" onClick={() => setActiveSection("layout")} />
                            <MenuCard icon={Palette} title="主題外觀" description="切換亮暗模式與主題色" color="purple" onClick={() => setActiveSection("theme")} />
                            <MenuCard icon={Image} title="自訂背景" description="設定頁面背景樣式與圖片" color="red" onClick={() => setActiveSection("background")} />
                            <MenuCard icon={Zap} title="偏好設定" description="調整公告、更新提示等行為" color="orange" onClick={() => setActiveSection("preference")} />
                            <MenuCard icon={HardDrive} title="系統資料" description="版本資訊與資料匯入匯出" color="green" onClick={() => setActiveSection("system")} />
                        </div>

                        <Separator className="my-6" />

                        <div className="flex flex-col items-center gap-4">
                            {!isResetConfirming ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsResetConfirming(true)}
                                    className="h-10 rounded-full px-6 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
                                >
                                    <RefreshCw className="mr-2 h-3 w-3" />
                                    重置所有設定
                                </Button>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.1, ease: "easeOut" }}
                                    className="flex flex-col items-center gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-6"
                                >
                                    <p className="text-sm font-bold text-destructive">確定要重置所有設定嗎？</p>
                                    <p className="text-xs text-muted-foreground">這會清除目前設定並恢復預設值。</p>
                                    <div className="flex w-full gap-3">
                                        <Button variant="destructive" size="sm" onClick={handleReset} className="flex-1">
                                            重置
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => setIsResetConfirming(false)} className="flex-1">
                                            取消
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                            <p className="mt-2 font-mono text-[10px] text-muted-foreground/40">Current Environment: production_v2</p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={fastTransition}
                        className="space-y-6"
                    >
                        <div className="mb-8 flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setActiveSection(null)}
                                className="h-9 w-9 rounded-xl"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <Separator orientation="vertical" className="h-6" />
                            <div>
                                <h3 className="text-lg font-bold tracking-tight">{currentSectionTitle}</h3>
                                <p className="text-[11px] text-muted-foreground">修改後會立即套用</p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm">
                            {activeSection === "layout" && (
                                <LayoutSection
                                    settings={settings}
                                    disabledComponents={disabledComponents}
                                    onToggle={toggleComponent}
                                    onShowAll={showAll}
                                    onSave={reorderComponents}
                                    onComplete={handleComplete}
                                />
                            )}
                            {activeSection === "theme" && (
                                <div className="space-y-8 p-5">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1 w-1 rounded-full bg-primary" />
                                            <h4 className="text-sm font-semibold">主題模式</h4>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            {MODES.map((mode) => {
                                                const Icon = mode.icon;
                                                const isActive = settings.themeMode === mode.value;
                                                return (
                                                    <button
                                                        key={mode.value}
                                                        onClick={() => setThemeMode(mode.value)}
                                                        className={cn(
                                                            "relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                                                            "hover:border-primary/50",
                                                            isActive
                                                                ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                                                                : "border-border/50 bg-background/60 hover:bg-muted/30"
                                                        )}
                                                    >
                                                        {isActive && (
                                                            <motion.div
                                                                layoutId="theme-mode-active"
                                                                className="absolute inset-0 rounded-xl bg-primary/5"
                                                                transition={{ duration: 0.12, ease: "easeOut" }}
                                                            />
                                                        )}
                                                        <div className={cn("rounded-lg p-1.5 transition-colors", isActive ? "text-primary" : "text-muted-foreground")}>
                                                            <Icon className="relative h-5 w-5" />
                                                        </div>
                                                        <span className={cn("relative text-xs font-semibold", isActive ? "text-primary" : "text-muted-foreground")}>
                                                            {mode.name}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1 w-1 rounded-full bg-primary" />
                                            <h4 className="text-sm font-semibold">主題色</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                            {COLORS.map((color) => {
                                                const isActive = settings.themeColor === color.value;
                                                return (
                                                    <button
                                                        key={color.value}
                                                        onClick={() => setThemeColor(color.value)}
                                                        className={cn(
                                                            "group relative flex h-16 items-center justify-center overflow-hidden rounded-xl border-2 transition-all",
                                                            isActive
                                                                ? "border-primary shadow-sm shadow-primary/20"
                                                                : "border-border/30 opacity-80 hover:border-primary/40 hover:opacity-100"
                                                        )}
                                                    >
                                                        <div className="absolute inset-0 transition-transform duration-200 group-hover:scale-110" style={{ background: color.color }} />
                                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent py-1.5">
                                                            <span className="block text-center text-[10px] font-bold uppercase tracking-tight text-white">
                                                                {color.name}
                                                            </span>
                                                        </div>
                                                        {isActive && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm"
                                                            >
                                                                <Check className="h-3 w-3 text-primary" />
                                                            </motion.div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeSection === "background" && (
                                <div className="space-y-8 p-5">
                                    <div className="flex items-center gap-2">
                                        <div className="h-1 w-1 rounded-full bg-primary" />
                                        <h4 className="text-sm font-semibold">背景樣式</h4>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        {BUILTIN_BACKGROUND_OPTIONS.map((background) => {
                                            const isActive = settings.pageBackground === background.value;
                                            const previewStyle = background.previewImage
                                                ? {
                                                      backgroundImage: `linear-gradient(hsl(0 0% 0% / 0.2), hsl(0 0% 0% / 0.2)), url("${background.previewImage}")`,
                                                      backgroundPosition: "center",
                                                      backgroundSize: "cover",
                                                  }
                                                : background.value === "image" && settings.pageBackgroundImage
                                                  ? {
                                                        backgroundImage: `linear-gradient(hsl(0 0% 0% / 0.2), hsl(0 0% 0% / 0.2)), url("${settings.pageBackgroundImage}")`,
                                                        backgroundPosition: "center",
                                                        backgroundSize: "cover",
                                                    }
                                                  : { background: background.color };

                                            return (
                                                <button
                                                    key={background.value}
                                                    onClick={() => setPageBackground(background.value)}
                                                    className={cn(
                                                        "group relative h-24 overflow-hidden rounded-xl border-2 text-left transition-all",
                                                        isActive ? "border-primary shadow-sm shadow-primary/20" : "border-border/30 hover:border-primary/40"
                                                    )}
                                                >
                                                    <div className="absolute inset-0 transition-transform duration-200 group-hover:scale-105" style={previewStyle} />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                                                    <div className="absolute inset-x-0 bottom-0 p-3">
                                                        <span className="text-sm font-bold text-white drop-shadow-sm">{background.name}</span>
                                                    </div>
                                                    {isActive && (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm"
                                                        >
                                                            <Check className="h-3 w-3 text-primary" />
                                                        </motion.div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1 w-1 rounded-full bg-primary" />
                                            <h4 className="text-sm font-semibold">圖片網址</h4>
                                        </div>
                                        <div className="flex flex-col gap-3 sm:flex-row">
                                            <Input
                                                value={backgroundUrlInput}
                                                onChange={(e) => setBackgroundUrlInput(e.target.value)}
                                                placeholder="https://example.com/background.jpg"
                                                className="flex-1"
                                            />
                                            <Button variant="outline" onClick={handleBackgroundUrlApply} className="shrink-0">
                                                <Link2 className="mr-2 h-4 w-4" />
                                                套用網址
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1 w-1 rounded-full bg-primary" />
                                            <h4 className="text-sm font-semibold">上傳圖片</h4>
                                        </div>
                                        <div className="flex flex-col gap-3 sm:flex-row">
                                            <Button variant="outline" onClick={() => backgroundUploadRef.current?.click()}>
                                                <Upload className="mr-2 h-4 w-4" />
                                                選擇圖片
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => {
                                                    setBackgroundUrlInput("");
                                                    setPageBackgroundImage("");
                                                    setPageBackground("default");
                                                }}
                                            >
                                                清除圖片
                                            </Button>
                                        </div>
                                        <input
                                            ref={backgroundUploadRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleBackgroundUpload}
                                            className="hidden"
                                        />
                                    </div>
                                </div>
                            )}
                            {activeSection === "preference" && (
                                <div className="p-5">
                                    <div className="mb-6 flex items-center gap-2">
                                        <div className="h-1 w-1 rounded-full bg-primary" />
                                        <h4 className="text-sm font-semibold">偏好設定</h4>
                                        <span className="ml-2 text-[11px] text-muted-foreground">調整啟動行為與常用介面細節</span>
                                    </div>
                                    <div className="space-y-1">
                                        <PrefOption
                                            id="preference-update"
                                            label="顯示更新提示"
                                            desc="有新版本時顯示更新提示視窗"
                                            checked={!settings.disableUpdatePrompt}
                                            onChange={(value: boolean) => setDisableUpdatePrompt(!value)}
                                        />
                                        <PrefOption
                                            id="preference-announcement"
                                            label="啟動顯示公告"
                                            desc="登入首頁後自動展開 7 天內最新快訊"
                                            checked={settings.showLatestAnnouncementOnStartup}
                                            onChange={(value: boolean) => setShowLatestAnnouncementOnStartup(!!value)}
                                        />
                                        <PrefOption
                                            id="preference-favicon"
                                            label="顯示網站圖示"
                                            desc="常用網站卡片顯示 favicon"
                                            checked={settings.showSiteFavicons}
                                            onChange={(value: boolean) => setShowSiteFavicons(!!value)}
                                        />
                                        <PrefOption
                                            id="preference-default-countdowns"
                                            label="停用預設倒數計時器"
                                            desc="關閉後只顯示自訂的倒數計時，不載入學校預設倒數"
                                            checked={settings.disableDefaultCountdowns}
                                            onChange={(value: boolean) => setDisableDefaultCountdowns(!!value)}
                                        />
                                    </div>
                                </div>
                            )}
                            {activeSection === "system" && (
                                <div className="space-y-8 p-5">
                                    <div className="relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-card to-muted/30 p-6 shadow-sm">
                                        <div className="absolute -right-6 -top-6 opacity-[3%]">
                                            <RefreshCw className="h-32 w-32" />
                                        </div>
                                        <div className="relative space-y-5">
                                            <div className="text-center">
                                                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">版本資訊</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="rounded-xl border border-border/30 bg-background/60 p-4">
                                                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">目前版本</p>
                                                    <p className="font-mono text-lg font-bold">{currentVersion || "v1.0.0"}</p>
                                                </div>
                                                <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-4">
                                                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-primary">最新版本</p>
                                                    <p className="font-mono text-lg font-bold">{latestVersionFromServer}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <AdminUnlockButton />
                                                <Button
                                                    size="default"
                                                    variant={canUpdate ? "default" : "outline"}
                                                    disabled={!canUpdate}
                                                    onClick={handleUpdate}
                                                    className={cn("h-11 w-full text-sm font-semibold", canUpdate && "shadow-sm")}
                                                >
                                                    {canUpdate ? "前往更新" : "已是最新版本"}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                                            <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">資料管理</h4>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <Button
                                                variant="outline"
                                                className="flex h-20 items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/40 transition-all hover:border-primary/40 hover:bg-muted/30"
                                                onClick={handleExport}
                                            >
                                                <Download className="h-5 w-5 text-primary" />
                                                <span className="text-sm font-semibold">匯出資料</span>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex h-20 items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/40 transition-all hover:border-primary/40 hover:bg-muted/30"
                                                onClick={handleImportClick}
                                            >
                                                <Upload className="h-5 w-5 text-primary" />
                                                <span className="text-sm font-semibold">匯入資料</span>
                                            </Button>
                                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function MenuCard({
    icon: Icon,
    title,
    description,
    color,
    onClick,
}: {
    icon: typeof Settings;
    title: string;
    description: string;
    color: "blue" | "purple" | "red" | "orange" | "green";
    onClick: () => void;
}) {
    const colorMap = {
        blue: "bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/15",
        purple: "bg-purple-500/10 text-purple-500 group-hover:bg-purple-500/15",
        red: "bg-red-500/10 text-red-500 group-hover:bg-red-500/15",
        orange: "bg-orange-500/10 text-orange-500 group-hover:bg-orange-500/15",
        green: "bg-green-500/10 text-green-500 group-hover:bg-green-500/15",
    };
    const borderColorMap = {
        blue: "group-hover:border-blue-500/30",
        purple: "group-hover:border-purple-500/30",
        red: "group-hover:border-red-500/30",
        orange: "group-hover:border-orange-500/30",
        green: "group-hover:border-green-500/30",
    };

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={fastTransition}
            className={cn(
                "group relative flex w-full items-center gap-4 overflow-hidden rounded-xl border border-border/50 bg-card p-4 text-left transition-all hover:shadow-md",
                borderColorMap[color]
            )}
        >
            <div className={cn("rounded-xl p-3 transition-all duration-200", colorMap[color])}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-bold tracking-tight text-foreground">{title}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{description}</p>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/30 text-muted-foreground opacity-0 transition-all group-hover:opacity-100">
                <ChevronLeft className="h-4 w-4 -rotate-90" />
            </div>
        </motion.button>
    );
}

function PrefOption({
    id,
    label,
    desc,
    checked,
    onChange,
}: {
    id: string;
    label: string;
    desc: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between rounded-xl border border-border/30 bg-background/60 p-4 transition-all hover:bg-muted/20">
            <div className="space-y-0.5">
                <Label htmlFor={id} className="cursor-pointer text-sm font-semibold text-foreground">
                    {label}
                </Label>
                <p className="text-[11px] text-muted-foreground/80">{desc}</p>
            </div>
            <Switch id={id} checked={checked} onCheckedChange={onChange} />
        </div>
    );
}

function LayoutSection({
    settings,
    disabledComponents,
    onToggle,
    onShowAll,
    onSave,
    onComplete,
}: {
    settings: AppSettings;
    disabledComponents: ComponentSettings[];
    onToggle: (id: string) => void;
    onShowAll: () => void;
    onSave: (components: ComponentSettings[]) => void;
    onComplete: () => void;
}) {
    const [tmpComponents, setTmpComponents] = useState<ComponentSettings[]>([]);

    useEffect(() => {
        const enabled = settings.components.filter((c: ComponentSettings) => c.enabled).sort((a: ComponentSettings, b: ComponentSettings) => a.order - b.order);
        setTmpComponents(enabled);
    }, [settings.components]);

    const handleSave = () => {
        onSave(tmpComponents);
        onComplete();
    };

    return (
        <div className="space-y-5 p-5">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="space-y-1">
                    <p className="text-sm font-semibold">首頁版面</p>
                    <p className="text-[11px] text-muted-foreground">拖曳排序首頁元件，完成後再按儲存</p>
                </div>
                <div className="flex w-full gap-2 sm:w-auto">
                    <Button variant="outline" size="sm" onClick={onShowAll} className="h-9 flex-1 sm:flex-none">
                        全部顯示
                    </Button>
                    <Button size="sm" onClick={handleSave} className="h-9 flex-1 shadow-sm sm:flex-none">
                        儲存排序
                    </Button>
                </div>
            </div>

            <Reorder.Group axis="y" values={tmpComponents} onReorder={setTmpComponents} className="flex flex-col gap-2">
                <AnimatePresence initial={false}>
                    {tmpComponents.map((component) => (
                        <SortableItem key={component.id} component={component} onToggle={onToggle} />
                    ))}
                </AnimatePresence>
            </Reorder.Group>

            {disabledComponents.length > 0 && (
                <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <List className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">已隱藏元件</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {disabledComponents.map((component) => (
                            <div key={component.id} className="flex items-center gap-3 rounded-xl border border-dashed border-border/40 bg-background/20 p-3.5">
                                <Switch
                                    id={`disabled-${component.id}`}
                                    checked={false}
                                    onCheckedChange={() => onToggle(component.id)}
                                />
                                <Label htmlFor={`disabled-${component.id}`} className="cursor-pointer text-sm font-medium text-muted-foreground">
                                    {component.label}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function AdminUnlockButton() {
  const { toast } = useToast();
  const [clickCount, setClickCount] = useState(0);
  const alreadyUnlocked = isAdminUnlocked();

  const handleClick = () => {
    if (alreadyUnlocked) {
      toast({ title: "管理後台已解鎖 🎉", description: "請返回主頁即可看到管理分頁" });
      return;
    }

    const next = clickCount + 1;
    setClickCount(next);

    if (next >= 5) {
      unlockAdmin();
      toast({
        title: "🔓 管理後台已解鎖",
        description: "請返回主頁即可看到管理分頁",
      });
      setClickCount(0);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-all hover:bg-primary/20 hover:scale-110 active:scale-90"
      title={alreadyUnlocked ? "管理後台已解鎖" : `點擊解鎖管理後台 (${clickCount}/5)`}
    >
      <RefreshCw
        className={cn(
          "h-3.5 w-3.5 text-primary transition-all",
          alreadyUnlocked && "text-green-500",
        )}
      />
    </button>
  );
}

function SortableItem({
    component,
    onToggle,
}: {
    component: ComponentSettings;
    onToggle: (id: string) => void;
}) {
    const controls = useDragControls();

    return (
        <Reorder.Item
            value={component}
            dragListener={false}
            dragControls={controls}
            dragElastic={0.05}
            dragMomentum={false}
            layout="position"
            className="group relative flex select-none items-center gap-3 rounded-xl border border-border/40 bg-card p-3.5 shadow-sm transition-colors touch-none"
            whileDrag={{
                scale: 1.02,
                zIndex: 50,
                backgroundColor: "hsl(var(--muted) / 0.6)",
                boxShadow: "0 8px 25px -5px rgb(0 0 0 / 0.08), 0 4px 8px -4px rgb(0 0 0 / 0.04)",
            }}
        >
            <div
                className="flex cursor-grab items-center justify-center rounded-lg bg-muted/30 p-2 text-muted-foreground/60 transition-colors hover:text-primary active:cursor-grabbing"
                style={{ touchAction: "none" }}
                onPointerDown={(e) => controls.start(e)}
            >
                <GripVertical className="h-4 w-4" />
            </div>

            <Switch
                id={`component-${component.id}`}
                checked={component.enabled}
                onCheckedChange={() => onToggle(component.id)}
            />

            <Label htmlFor={`component-${component.id}`} className="cursor-pointer text-sm font-medium text-foreground">
                {component.label}
            </Label>
        </Reorder.Item>
    );
}
