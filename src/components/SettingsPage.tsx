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
    ChevronDown,
} from "lucide-react";
import { Reorder, motion, useDragControls, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/hooks/SettingsContext";
import { useToast } from "@/hooks/use-toast";
import { getCurrentVersion, LATEST_VERSION, exportUserData, importUserData, isAdminUnlocked, unlockAdmin } from "@/lib/app-version";
import { cn } from "@/lib/utils";

const MODES = [
    { name: "淺色", value: "light", icon: Sun },
    { name: "深色", value: "dark", icon: Moon },
    { name: "跟隨系統", value: "system", icon: Monitor },
] as const;

const COLORS = [
    { name: "藍色", value: "blue", color: "#3b82f6" },
    { name: "紅色", value: "red", color: "#ef4444" },
    { name: "綠色", value: "green", color: "#10b981" },
    { name: "橘色", value: "orange", color: "#f59e0b" },
    { name: "紫色", value: "purple", color: "#8b5cf6" },
    { name: "霓虹", value: "neon", color: "#00f3ff" },
    { name: "現代", value: "modern", color: "linear-gradient(135deg, #fbbf24, #f97316)" },
    { name: "漸層", value: "gradient", color: "linear-gradient(135deg, #3b82f6, #8b5cf6, #ef4444)" },
];

const BUILTIN_BACKGROUND_OPTIONS = [
    { name: "預設", value: "default", color: "linear-gradient(135deg, hsl(var(--background)), hsl(var(--muted)))" },
    { name: "背景一", value: "preset-1", color: "linear-gradient(135deg, #1e3a8a, #7c3aed, #f59e0b)", previewImage: "/background-1.png" },
    { name: "背景二", value: "preset-2", color: "linear-gradient(135deg, #0f172a, #475569, #94a3b8)", previewImage: "/background-2.png" },
    { name: "圖片", value: "image", color: "linear-gradient(135deg, #334155, #64748b, #cbd5e1)" },
];

type Section = "layout" | "theme" | "background" | "preference" | "system" | null;

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

    const currentVersion = getCurrentVersion();
    const canUpdate = currentVersion !== LATEST_VERSION;
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
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="space-y-6"
                    >
                        <div className="mb-8 flex items-center gap-3">
                            <div className="rounded-xl bg-primary/10 p-2">
                                <Settings className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">設定</h2>
                                <p className="text-xs text-muted-foreground">調整首頁內容、主題與個人偏好</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <MenuCard icon={GripVertical} title="版面排序" description="調整首頁元件顯示順序與啟用狀態" color="blue" onClick={() => setActiveSection("layout")} />
                            <MenuCard icon={Palette} title="主題外觀" description="切換亮暗模式與主題色" color="purple" onClick={() => setActiveSection("theme")} />
                            <MenuCard icon={Image} title="自訂背景" description="設定頁面背景樣式與套用效果" color="blue" onClick={() => setActiveSection("background")} />
                            <MenuCard icon={Zap} title="偏好設定" description="調整公告、更新提示與網站圖示行為" color="orange" onClick={() => setActiveSection("preference")} />
                            <MenuCard icon={HardDrive} title="系統資料" description="更新版本與匯入匯出資料" color="green" onClick={() => setActiveSection("system")} />
                        </div>

                        <div className="flex flex-col items-center gap-4 pt-8">
                            {!isResetConfirming ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsResetConfirming(true)}
                                    className="rounded-full px-6 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
                                >
                                    <RefreshCw className="mr-2 h-3 w-3" />
                                    重置所有設定
                                </Button>
                            ) : (
                                <div className="flex flex-col items-center gap-3 rounded-[28px] border border-destructive/20 bg-destructive/5 p-6">
                                    <p className="text-sm font-bold text-destructive">確定要重置所有設定嗎？</p>
                                    <p className="text-[10px] text-muted-foreground">這會清除目前設定並恢復預設值。</p>
                                    <div className="flex w-full gap-2">
                                        <Button variant="destructive" size="sm" onClick={handleReset} className="flex-1 rounded-xl">
                                            重置
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => setIsResetConfirming(false)} className="flex-1 rounded-xl">
                                            取消
                                        </Button>
                                    </div>
                                </div>
                            )}
                            <p className="mt-4 font-mono text-[10px] text-muted-foreground/50">Current Environment: production_v2</p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="space-y-6"
                    >
                        <div className="mb-8 flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setActiveSection(null)}
                                className="h-10 w-10 rounded-2xl border-border/40 hover:bg-muted"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <h3 className="text-xl font-bold tracking-tight">{currentSectionTitle}</h3>
                                <p className="text-xs text-muted-foreground">修改後會立即套用</p>
                            </div>
                        </div>

                        <div className="rounded-[32px] border border-border/20 bg-muted/10 p-2 backdrop-blur-sm">
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
                                <div className="space-y-10 p-4 py-6">
                                    <div className="space-y-5">
                                        <div className="px-2">
                                            <h4 className="text-lg font-bold">主題模式</h4>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            {MODES.map((mode) => {
                                                const Icon = mode.icon;
                                                const isActive = settings.themeMode === mode.value;
                                                return (
                                                    <Button
                                                        key={mode.value}
                                                        variant={isActive ? "default" : "outline"}
                                                        className={cn(
                                                            "h-24 flex-col gap-2 rounded-3xl border-2 transition-all",
                                                            isActive ? "border-primary shadow-lg shadow-primary/20" : "border-transparent bg-background/50 hover:bg-muted"
                                                        )}
                                                        onClick={() => setThemeMode(mode.value)}
                                                    >
                                                        <div className={cn("rounded-xl p-2", isActive ? "bg-primary-foreground/20" : "bg-muted")}>
                                                            <Icon className="h-6 w-6" />
                                                        </div>
                                                        <span className="text-xs font-black">{mode.name}</span>
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div className="px-2">
                                            <h4 className="text-lg font-bold">主題色</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                            {COLORS.map((color) => {
                                                const isActive = settings.themeColor === color.value;
                                                return (
                                                    <button
                                                        key={color.value}
                                                        onClick={() => setThemeColor(color.value)}
                                                        className={cn(
                                                            "group relative flex h-20 items-center justify-center overflow-hidden rounded-[22px] border-2 bg-background transition-all",
                                                            isActive ? "z-10 scale-[1.03] border-primary shadow-xl" : "border-border/30 opacity-80 hover:border-primary/50 hover:opacity-100"
                                                        )}
                                                    >
                                                        <div className="absolute inset-0 transition-transform group-hover:scale-110" style={{ background: color.color }} />
                                                        <div className="absolute inset-x-0 bottom-0 bg-black/40 py-1.5 text-center text-[10px] font-black uppercase tracking-tighter text-white backdrop-blur-md">
                                                            {color.name}
                                                        </div>
                                                        {isActive && (
                                                            <div className="absolute right-2 top-2 rounded-full bg-white p-1 text-primary shadow-md">
                                                                <Check className="h-3 w-3" />
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeSection === "background" && (
                                <div className="space-y-10 p-4 py-6">
                                    <div className="space-y-5">
                                        <div className="px-2">
                                            <h4 className="text-lg font-bold">自訂背景</h4>
                                            <p className="text-xs text-muted-foreground">選背景來源後會直接套用到整個頁面</p>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                            {BUILTIN_BACKGROUND_OPTIONS.map((background) => {
                                                const isActive = settings.pageBackground === background.value;
                                                const previewStyle = background.previewImage
                                                    ? {
                                                          backgroundImage: `linear-gradient(hsl(0 0% 0% / 0.18), hsl(0 0% 0% / 0.18)), url("${background.previewImage}")`,
                                                          backgroundPosition: "center",
                                                          backgroundSize: "cover",
                                                      }
                                                    : background.value === "image" && settings.pageBackgroundImage
                                                      ? {
                                                            backgroundImage: `linear-gradient(hsl(0 0% 0% / 0.18), hsl(0 0% 0% / 0.18)), url("${settings.pageBackgroundImage}")`,
                                                            backgroundPosition: "center",
                                                            backgroundSize: "cover",
                                                        }
                                                      : { background: background.color };

                                                return (
                                                    <button
                                                        key={background.value}
                                                        onClick={() => setPageBackground(background.value)}
                                                        className={cn(
                                                            "group relative h-24 overflow-hidden rounded-[22px] border-2 text-left transition-all",
                                                            isActive ? "scale-[1.02] border-primary shadow-xl" : "border-border/30 hover:border-primary/50"
                                                        )}
                                                    >
                                                        <div className="absolute inset-0 transition-transform group-hover:scale-105" style={previewStyle} />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
                                                        <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                                                            <div className="text-sm font-black">{background.name}</div>
                                                        </div>
                                                        {isActive && (
                                                            <div className="absolute right-2 top-2 rounded-full bg-white p-1 text-primary shadow-md">
                                                                <Check className="h-3 w-3" />
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div className="px-2">
                                            <h4 className="text-lg font-bold">圖片網址</h4>
                                        </div>
                                        <div className="rounded-[24px] border border-border/40 bg-background/60 p-4 backdrop-blur-sm">
                                            <div className="flex flex-col gap-3 sm:flex-row">
                                                <Input
                                                    value={backgroundUrlInput}
                                                    onChange={(e) => setBackgroundUrlInput(e.target.value)}
                                                    placeholder="https://example.com/background.jpg"
                                                    className="flex-1"
                                                />
                                                <Button variant="outline" onClick={handleBackgroundUrlApply}>
                                                    <Link2 className="h-4 w-4" />
                                                    套用網址
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div className="px-2">
                                            <h4 className="text-lg font-bold">上傳圖片</h4>
                                        </div>
                                        <div className="rounded-[24px] border border-border/40 bg-background/60 p-4 backdrop-blur-sm">
                                            <div className="flex flex-col gap-3 sm:flex-row">
                                                <Button variant="outline" onClick={() => backgroundUploadRef.current?.click()}>
                                                    <Upload className="h-4 w-4" />
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
                                </div>
                            )}
                            {activeSection === "preference" && (
                                <div className="p-4 py-6">
                                    <div className="mb-6 px-2">
                                        <h4 className="text-lg font-bold">偏好設定</h4>
                                        <p className="text-xs text-muted-foreground">調整啟動行為與常用介面細節</p>
                                    </div>
                                    <div className="space-y-2">
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
                                <div className="space-y-10 p-4 py-8">
                                    <div className="group relative overflow-hidden rounded-[32px] border border-border/50 bg-card p-8 shadow-sm">
                                        <div className="absolute right-0 top-0 p-8 opacity-5 transition-transform group-hover:scale-125">
                                            <RefreshCw className="h-24 w-24" />
                                        </div>
                                        <div className="relative z-10 flex flex-col items-center space-y-6 text-center">
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-bold uppercase tracking-widest text-primary">版本資訊</h4>
                                                <div className="flex w-full items-center justify-center gap-4">
                                                    <div className="flex-1 rounded-2xl border border-border/20 bg-muted/40 p-4">
                                                        <p className="mb-1 text-[10px] font-bold uppercase text-muted-foreground">目前版本</p>
                                                        <p className="font-mono text-lg font-black">{currentVersion || "v1.0.0"}</p>
                                                    </div>
                                                    <AdminUnlockButton />
                                                    <div className="flex-1 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                                                        <p className="mb-1 text-[10px] font-bold uppercase text-primary">最新版本</p>
                                                        <p className="font-mono text-lg font-black">{LATEST_VERSION}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                size="lg"
                                                variant={canUpdate ? "default" : "outline"}
                                                disabled={!canUpdate}
                                                onClick={handleUpdate}
                                                className={cn("h-14 w-full rounded-2xl text-base font-bold shadow-xl shadow-primary/20", canUpdate && "animate-pulse")}
                                            >
                                                {canUpdate ? "前往更新" : "已是最新版本"}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="px-2">
                                            <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">資料管理</h4>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <Button
                                                variant="outline"
                                                className="h-24 flex-col gap-2 rounded-[24px] border-2 border-dashed border-border/50 transition-all hover:border-primary/50 hover:bg-muted/50"
                                                onClick={handleExport}
                                            >
                                                <Download className="h-6 w-6 text-primary" />
                                                <span className="text-xs font-bold">匯出資料</span>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="h-24 flex-col gap-2 rounded-[24px] border-2 border-dashed border-border/50 transition-all hover:border-primary/50 hover:bg-muted/50"
                                                onClick={handleImportClick}
                                            >
                                                <Upload className="h-6 w-6 text-primary" />
                                                <span className="text-xs font-bold">匯入資料</span>
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
    color: "blue" | "purple" | "orange" | "green";
    onClick: () => void;
}) {
    const colorMap = {
        blue: "bg-blue-500/10 text-blue-500",
        purple: "bg-purple-500/10 text-purple-500",
        orange: "bg-orange-500/10 text-orange-500",
        green: "bg-green-500/10 text-green-500",
    };

    return (
        <button
            onClick={onClick}
            className="group relative flex w-full items-center gap-5 overflow-hidden rounded-[24px] border border-border/50 bg-card p-5 text-left transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
        >
            <div className={cn("rounded-2xl p-4 transition-transform group-hover:scale-110", colorMap[color])}>
                <Icon className="h-7 w-7" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-lg font-black tracking-tight text-foreground">{title}</p>
                <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="h-10 w-10 translate-x-4 rounded-full bg-muted/30 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                <div className="flex h-full w-full items-center justify-center">
                    <ChevronDown className="-rotate-90 h-5 w-5" />
                </div>
            </div>
        </button>
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
        <div className="flex items-center justify-between rounded-[24px] border border-border/40 bg-background p-5 transition-all hover:bg-muted/30">
            <div className="space-y-0.5">
                <Label htmlFor={id} className="cursor-pointer text-base font-bold text-foreground">
                    {label}
                </Label>
                <p className="text-[10px] text-muted-foreground">{desc}</p>
            </div>
            <Checkbox id={id} checked={checked} onCheckedChange={onChange} className="h-6 w-6 rounded-lg data-[state=checked]:bg-primary" />
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
    settings: any;
    disabledComponents: any[];
    onToggle: (id: string) => void;
    onShowAll: () => void;
    onSave: (components: any[]) => void;
    onComplete: () => void;
}) {
    const [tmpComponents, setTmpComponents] = useState<any[]>([]);

    useEffect(() => {
        const enabled = settings.components.filter((component: any) => component.enabled).sort((a: any, b: any) => a.order - b.order);
        setTmpComponents(enabled);
    }, [settings.components]);

    const handleSave = () => {
        onSave(tmpComponents);
        onComplete();
    };

    return (
        <div className="space-y-6 p-4">
            <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-border/20 bg-background/50 p-4 sm:flex-row sm:items-center">
                <div className="space-y-1">
                    <p className="text-sm font-bold">首頁版面</p>
                    <p className="text-[10px] text-muted-foreground">拖曳排序首頁元件，完成後再按儲存</p>
                </div>
                <div className="flex w-full gap-2 sm:w-auto">
                    <Button variant="outline" size="sm" onClick={onShowAll} className="h-10 flex-1 rounded-xl sm:flex-none">
                        全部顯示
                    </Button>
                    <Button size="sm" onClick={handleSave} className="h-10 flex-1 rounded-xl shadow-lg shadow-primary/20 sm:flex-none">
                        儲存排序
                    </Button>
                </div>
            </div>

            <Reorder.Group axis="y" values={tmpComponents} onReorder={setTmpComponents} className="flex flex-col gap-3">
                {tmpComponents.map((component) => (
                    <SortableItem key={component.id} component={component} onToggle={onToggle} />
                ))}
            </Reorder.Group>

            {disabledComponents.length > 0 && (
                <div className="space-y-4 py-4">
                    <div className="flex items-center gap-2 px-2 text-muted-foreground">
                        <List className="h-4 w-4" />
                        <h4 className="text-xs font-bold uppercase tracking-widest">已隱藏元件</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {disabledComponents.map((component) => (
                            <div key={component.id} className="flex items-center gap-4 rounded-2xl border border-dashed border-border/50 bg-background/30 p-4">
                                <Checkbox
                                    id={`disabled-${component.id}`}
                                    checked={false}
                                    onCheckedChange={() => onToggle(component.id)}
                                    className="h-5 w-5 rounded-md"
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

/** 版本資訊區的隱藏解鎖按鈕：點 5 下解鎖管理後台 */
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
      className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 transition-all hover:bg-primary/20 hover:scale-110 active:scale-90"
      title={alreadyUnlocked ? "管理後台已解鎖" : `點擊解鎖管理後台 (${clickCount}/5)`}
    >
      <RefreshCw
        className={cn(
          "h-4 w-4 text-primary transition-all",
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
    component: any;
    onToggle: (id: string) => void;
}) {
    const controls = useDragControls();

    return (
        <Reorder.Item
            value={component}
            dragListener={false}
            dragControls={controls}
            dragElastic={0.1}
            dragMomentum={false}
            layout="position"
            className="group relative flex select-none items-center gap-4 rounded-2xl border border-border/50 bg-card p-4 shadow-sm touch-none"
            whileDrag={{
                scale: 1.02,
                zIndex: 50,
                backgroundColor: "hsl(var(--muted) / 0.8)",
                boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
            }}
        >
            <div
                className="cursor-grab rounded-xl bg-muted/40 p-2 text-muted-foreground transition-colors group-hover:text-primary active:cursor-grabbing"
                style={{ touchAction: "none" }}
                onPointerDown={(e) => controls.start(e)}
            >
                <GripVertical className="h-5 w-5" />
            </div>

            <Checkbox
                id={`component-${component.id}`}
                checked={component.enabled}
                onCheckedChange={() => onToggle(component.id)}
                className="h-5 w-5 rounded-md"
            />

            <Label htmlFor={`component-${component.id}`} className="cursor-pointer text-sm font-semibold text-foreground">
                {component.label}
            </Label>
        </Reorder.Item>
    );
}