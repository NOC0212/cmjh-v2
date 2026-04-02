import { 
    Settings, 
    ChevronUp, 
    ChevronDown, 
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
    Check 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/hooks/SettingsContext";
import { getCurrentVersion, LATEST_VERSION, exportUserData, importUserData } from "@/lib/app-version";
import { useToast } from "@/hooks/use-toast";
import { useRef, useState } from "react";
import { Reorder, AnimatePresence, motion, useDragControls } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

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
    const { 
        settings, 
        toggleComponent, 
        setThemeMode, 
        setThemeColor, 
        setDisableUpdatePrompt, 
        setShowLatestAnnouncementOnStartup, 
        setShowSiteFavicons, 
        resetToDefault, 
        showAll, 
        reorderComponents 
    } = useSettings();

    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [isResetConfirming, setIsResetConfirming] = useState(false);

    const currentVersion = getCurrentVersion();
    const canUpdate = currentVersion !== LATEST_VERSION;

    useEffect(() => {
        // 移除全局的布局初始化，改由子組件處理
    }, []);

    // 定位到各個區塊
    const handleCheckboxChange = (id: string) => toggleComponent(id);
    const handleShowAll = () => showAll();
    const handleReset = () => {
        resetToDefault();
        setIsResetConfirming(false);
        toast({ title: "已重置", description: "設定已恢復至預設值" });
    };

    const handleComplete = () => {
        toast({ title: "儲存成功", description: "正在套用變更..." });
        setTimeout(() => window.location.reload(), 500);
    };

    const handleUpdate = () => {
        if (!canUpdate) return;
        window.dispatchEvent(new CustomEvent("show-update-prompt"));
    };

    const handleExport = () => {
        exportUserData();
        toast({ title: "導出成功", description: "設定檔已準備好下載" });
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
                toast({ title: "匯入成功", description: "設定已套用，即將重新載入頁面" });
                setTimeout(() => window.location.reload(), 1500);
            } catch (err) {
                toast({ title: "匯入失敗", description: "請確保檔案格式正確", variant: "destructive" });
            }
        };
        reader.readAsText(file);
    };

    const disabledComponents = settings.components.filter((c: any) => !c.enabled);

    return (
        <div className="pb-8 text-foreground min-h-[500px]">
            <AnimatePresence mode="wait">
                {!activeSection ? (
                    <motion.div
                        key="main-menu"
                        initial={{ opacity: 0, scale: 0.992 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.992, x: -5 }}
                        transition={{ duration: 0.08, ease: "circOut" }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Settings className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">設定</h2>
                                <p className="text-xs text-muted-foreground">自訂您的個人風格</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <MenuCard
                                icon={GripVertical}
                                title="組件佈局與排序"
                                description="管理首頁顯示功能與排列順序"
                                color="blue"
                                onClick={() => setActiveSection("layout")}
                            />
                            <MenuCard
                                icon={Palette}
                                title="主題與視覺顏色"
                                description="個性化您的介面顏色與深淺模式"
                                color="purple"
                                onClick={() => setActiveSection("theme")}
                            />
                            <MenuCard
                                icon={Zap}
                                title="個人偏好設定"
                                description="調整自動公告、圖標顯示等行為"
                                color="orange"
                                onClick={() => setActiveSection("preference")}
                            />
                            <MenuCard
                                icon={HardDrive}
                                title="系統更新與備份管理"
                                description="版本檢查與設定備份/還原"
                                color="green"
                                onClick={() => setActiveSection("system")}
                            />
                        </div>

                        <div className="pt-8 flex flex-col items-center gap-4 relative">
                            <AnimatePresence mode="wait">
                                {!isResetConfirming ? (
                                    <motion.div
                                        key="reset-btn"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                    >
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => setIsResetConfirming(true)} 
                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all rounded-full px-6"
                                        >
                                            <RefreshCw className="h-3 w-3 mr-2" />
                                            重置所有設定至預設狀態
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="confirm-reset"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="flex flex-col items-center gap-3 bg-destructive/5 p-6 rounded-[28px] border border-destructive/20 backdrop-blur-md"
                                    >
                                        <p className="text-sm font-bold text-destructive">確定要重置所有內容嗎？</p>
                                        <p className="text-[10px] text-muted-foreground">此動作將清除所有自訂組件與顏色設定</p>
                                        <div className="flex gap-2 w-full">
                                            <Button variant="destructive" size="sm" onClick={handleReset} className="flex-1 rounded-xl">重置</Button>
                                            <Button variant="outline" size="sm" onClick={() => setIsResetConfirming(false)} className="flex-1 rounded-xl">取消</Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <p className="text-[10px] text-muted-foreground/50 font-mono mt-4">
                                Current Environment: production_v2
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="sub-page"
                        initial={{ opacity: 0, x: 5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 5 }}
                        transition={{ duration: 0.1, ease: "circOut" }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => setActiveSection(null)} 
                                className="rounded-2xl h-10 w-10 border-border/40 hover:bg-muted"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <h3 className="text-xl font-bold tracking-tight">
                                    {activeSection === "layout" && "組件佈局與排序"}
                                    {activeSection === "theme" && "主題與視覺顏色"}
                                    {activeSection === "preference" && "個人偏好設定"}
                                    {activeSection === "system" && "系統更新與備份管理"}
                                </h3>
                                <p className="text-xs text-muted-foreground">點擊返回鍵回到主目錄</p>
                            </div>
                        </div>

                        <div className="bg-muted/10 rounded-[32px] p-2 border border-border/20 backdrop-blur-sm">
                            {activeSection === "layout" && (
                                <LayoutSection 
                                    settings={settings} 
                                    reorderComponents={reorderComponents} 
                                    handleCheckboxChange={handleCheckboxChange}
                                    handleShowAll={handleShowAll}
                                    onComplete={handleComplete}
                                    disabledComponents={disabledComponents}
                                />
                            )}
                            {activeSection === "theme" && renderThemeSettings()}
                            {activeSection === "preference" && renderPreferenceSettings()}
                            {activeSection === "system" && renderSystemSettings()}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    function MenuCard({ icon: Icon, title, description, color, onClick }: any) {
        const colorMap: any = {
            blue: "text-blue-500 bg-blue-500/10",
            purple: "text-purple-500 bg-purple-500/10",
            orange: "text-orange-500 bg-orange-500/10",
            green: "text-green-500 bg-green-500/10",
        };

        return (
            <button
                onClick={onClick}
                className="group w-full flex items-center gap-5 p-5 rounded-[24px] bg-card border border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all text-left relative overflow-hidden"
            >
                <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110", colorMap[color] || "bg-primary/10 text-primary")}>
                    <Icon className="h-7 w-7" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-black text-lg tracking-tight text-foreground">{title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{description}</p>
                </div>
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-muted/30 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <ChevronDown className="h-5 w-5 -rotate-90" />
                </div>
            </button>
        );
    }


    function renderThemeSettings() {
        return (
            <div className="p-4 space-y-10 py-6">
                <div className="space-y-5">
                    <div className="px-2">
                        <h4 className="text-lg font-bold flex items-center gap-2">模式切換</h4>
                        <p className="text-xs text-muted-foreground">選擇您喜愛的明亮或深色視覺方案</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {MODES.map((mode) => {
                            const Icon = mode.icon;
                            const isActive = settings.themeMode === mode.value;
                            return (
                                <Button 
                                    key={mode.value} 
                                    variant={isActive ? "default" : "outline"} 
                                    className={cn("h-24 flex-col gap-2 rounded-3xl border-2 transition-all", isActive ? "border-primary shadow-lg shadow-primary/20" : "border-transparent bg-background/50 hover:bg-muted")}
                                    onClick={() => setThemeMode(mode.value as any)}
                                >
                                    <div className={cn("p-2 rounded-xl", isActive ? "bg-primary-foreground/20" : "bg-muted")}>
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
                        <h4 className="text-lg font-bold flex items-center gap-2">介面主題色</h4>
                        <p className="text-xs text-muted-foreground">為所有介面套用美觀的主題色</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {COLORS.map((color) => {
                            const isActive = settings.themeColor === color.value;
                            return (
                                <button 
                                    key={color.value} 
                                    onClick={() => setThemeColor(color.value)} 
                                    className={cn(
                                        "relative h-20 rounded-[22px] flex items-center justify-center transition-all bg-background border-2 overflow-hidden group",
                                        isActive ? "border-primary shadow-xl scale-[1.03] z-10" : "border-border/30 opacity-80 hover:opacity-100 hover:border-primary/50"
                                    )}
                                >
                                    <div className="absolute inset-0 transition-transform group-hover:scale-110" style={{ background: color.color }} />
                                    <div className="absolute inset-x-0 bottom-0 py-1.5 bg-black/40 backdrop-blur-md text-white text-[10px] font-black text-center uppercase tracking-tighter">
                                        {color.name}
                                    </div>
                                    {isActive && (
                                        <div className="absolute top-2 right-2 bg-white text-primary rounded-full p-1 shadow-md">
                                            <Check className="h-3 w-3" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    function renderPreferenceSettings() {
        return (
            <div className="p-4 py-6">
                <div className="px-2 mb-6">
                    <h4 className="text-lg font-bold">喜好設置</h4>
                    <p className="text-xs text-muted-foreground">微調系統的細微行為反應</p>
                </div>
                <div className="space-y-2">
                    <PrefOption id="p1" label="版本更新提醒" desc="在新版本發佈時於底端彈出視窗" checked={!settings.disableUpdatePrompt} onChange={(v: boolean) => setDisableUpdatePrompt(!v)} />
                    <PrefOption id="p2" label="啟動顯示公告" desc="登入首頁後自動展開 7 天內最新快訊" checked={settings.showLatestAnnouncementOnStartup} onChange={(v: boolean) => setShowLatestAnnouncementOnStartup(!!v)} />
                    <PrefOption id="p3" label="顯示 Favicon" desc="常用網站列表將載入其專屬圖表" checked={settings.showSiteFavicons} onChange={(v: boolean) => setShowSiteFavicons(!!v)} />
                </div>
            </div>
        );
    }

    function renderSystemSettings() {
        return (
            <div className="p-4 py-8 space-y-10">
                <div className="bg-card rounded-[32px] p-8 border border-border/50 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform">
                        <RefreshCw className="h-24 w-24" />
                    </div>
                    <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold tracking-widest text-primary uppercase">版本系統狀態</h4>
                            <div className="flex items-center gap-4 justify-center w-full">
                                <div className="flex-1 bg-muted/40 p-4 rounded-2xl border border-border/20">
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">目前版本</p>
                                    <p className="text-lg font-black font-mono">{currentVersion || "v1.0.0"}</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <RefreshCw className={cn("h-4 w-4 text-primary", canUpdate && "animate-spin-slow")} />
                                </div>
                                <div className="flex-1 bg-primary/5 p-4 rounded-2xl border border-primary/20">
                                    <p className="text-[10px] text-primary font-bold uppercase mb-1">最新版本</p>
                                    <p className="text-lg font-black font-mono">{LATEST_VERSION}</p>
                                </div>
                            </div>
                        </div>
                        <Button 
                            size="lg" 
                            variant={canUpdate ? "default" : "outline"} 
                            disabled={!canUpdate} 
                            onClick={handleUpdate} 
                            className={cn("w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-primary/20", canUpdate && "animate-pulse")}
                        >
                            {canUpdate ? "立即更新" : "系統已在最新狀態"}
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="px-2">
                        <h4 className="text-sm font-bold tracking-widest uppercase text-muted-foreground">備份管理</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Button variant="outline" className="h-24 flex-col gap-2 rounded-[24px] border-2 border-dashed border-border/50 hover:bg-muted/50 hover:border-primary/50 transition-all" onClick={handleExport}>
                            <Download className="h-6 w-6 text-primary" />
                            <span className="text-xs font-bold">匯出所有設定檔</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex-col gap-2 rounded-[24px] border-2 border-dashed border-border/50 hover:bg-muted/50 hover:border-primary/50 transition-all" onClick={handleImportClick}>
                            <Upload className="h-6 w-6 text-primary" />
                            <span className="text-xs font-bold">匯入設定檔備份</span>
                        </Button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                    </div>
                </div>
            </div>
        );
    }

    function PrefOption({ id, label, desc, checked, onChange }: any) {
        return (
            <div className="flex items-center justify-between p-5 rounded-[24px] bg-background border border-border/40 transition-all hover:bg-muted/30">
                <div className="space-y-0.5">
                    <Label htmlFor={id} className="text-base font-bold cursor-pointer text-foreground">{label}</Label>
                    <p className="text-[10px] text-muted-foreground">{desc}</p>
                </div>
                <Checkbox 
                    id={id} 
                    checked={checked} 
                    onCheckedChange={onChange} 
                    className="h-6 w-6 rounded-lg data-[state=checked]:bg-primary" 
                />
            </div>
        );
    }
}

// 內部組件：佈局排序區塊 (局部狀態管理，確保絲滑與準還)
function LayoutSection({ settings, reorderComponents, handleCheckboxChange, handleShowAll, onComplete, disabledComponents }: any) {
    const [tmpComponents, setTmpComponents] = useState<any[]>([]);
    const [layoutKey, setLayoutKey] = useState(0);

    // 智慧型佈局重整：使用防抖 (Debounce) 處理視窗縮放，確保座標快取始終最新
    useEffect(() => {
        let timeoutId: any = null;
        const handleResize = () => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setLayoutKey(prev => prev + 1);
            }, 200); 
        };
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, []);

    useEffect(() => {
        const enabled = settings.components
            .filter((c: any) => c.enabled)
            .sort((a: any, b: any) => a.order - b.order);
        setTmpComponents(enabled);
    }, [settings.components]);

    const handleSave = () => {
        reorderComponents(tmpComponents);
        onComplete();
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-background/50 p-4 rounded-3xl border border-border/20">
                <div className="space-y-1">
                    <p className="text-sm font-bold">排列管理</p>
                    <p className="text-[10px] text-muted-foreground">長按或拖曳左側圖標來重新排序組件</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" onClick={handleShowAll} className="flex-1 sm:flex-none h-10 rounded-xl">顯示全部</Button>
                    <Button size="sm" onClick={handleSave} className="flex-1 sm:flex-none h-10 rounded-xl shadow-lg shadow-primary/20">儲存佈局</Button>
                </div>
            </div>
            
            <Reorder.Group 
                key={layoutKey}
                axis="y" 
                values={tmpComponents} 
                onReorder={setTmpComponents} 
                className="flex flex-col gap-3"
            >
                {tmpComponents.map((component: any, index: number) => (
                    <SortableItem 
                        key={component.id} 
                        component={component} 
                        index={index} 
                        items={tmpComponents}
                        onReorder={setTmpComponents}
                        onCheckboxChange={handleCheckboxChange}
                    />
                ))}
            </Reorder.Group>

            {disabledComponents.length > 0 && (
                <div className="space-y-4 py-4">
                    <div className="flex items-center gap-2 px-2 text-muted-foreground">
                        <List className="h-4 w-4" />
                        <h4 className="text-xs font-bold tracking-widest uppercase">未啟用的組件</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {disabledComponents.map((component: any) => (
                            <div key={component.id} className="flex items-center gap-4 p-4 bg-background/30 rounded-2xl border border-dashed border-border/50">
                                <Checkbox 
                                    id={`disabled-${component.id}`} 
                                    checked={false} 
                                    onCheckedChange={() => handleCheckboxChange(component.id)}
                                    className="h-5 w-5 rounded-md"
                                />
                                <Label htmlFor={`disabled-${component.id}`} className="text-sm font-medium cursor-pointer text-muted-foreground">{component.label}</Label>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// 隔離項：確保拖拽手柄與物理避讓正確 (精準座標計算版)
function SortableItem({ component, index, items, onReorder, onCheckboxChange }: any) {
    const controls = useDragControls();

    return (
        <Reorder.Item 
            value={component} 
            dragListener={false}
            dragControls={controls}
            dragElastic={0.1}
            dragMomentum={false}
            layout="position"
            className="flex items-center gap-4 bg-card rounded-2xl p-4 border border-border/50 shadow-sm relative group select-none touch-none"
            whileDrag={{ 
                scale: 1.025, 
                zIndex: 50, 
                backgroundColor: "hsl(var(--muted)/0.8)",
                boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
            }}
        >
            <div 
                className="cursor-grab active:cursor-grabbing p-2 text-muted-foreground group-hover:text-primary transition-colors bg-muted/40 rounded-xl touch-none"
                style={{ touchAction: "none" }}
                onPointerDown={(e) => {
                    e.preventDefault(); 
                    controls.start(e);
                }}
            >
                <GripVertical className="h-4 w-4" />
            </div>
            <Checkbox 
                id={`enabled-${component.id}`} 
                checked={true} 
                onCheckedChange={() => onCheckboxChange(component.id)}
                className="h-5 w-5 rounded-md"
            />
            <Label htmlFor={`enabled-${component.id}`} className="flex-1 text-base font-bold cursor-pointer">{component.label}</Label>
            <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl active:bg-primary/10" onClick={(e) => {
                    e.stopPropagation();
                    const newItems = [...items];
                    if (index > 0) {
                        [newItems[index], newItems[index-1]] = [newItems[index-1], newItems[index]];
                        onReorder(newItems);
                    }
                }} disabled={index === 0}><ChevronUp className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl active:bg-primary/10" onClick={(e) => {
                    e.stopPropagation();
                    const newItems = [...items];
                    if (index < items.length - 1) {
                        [newItems[index], newItems[index+1]] = [newItems[index+1], newItems[index]];
                        onReorder(newItems);
                    }
                }} disabled={index === items.length - 1}><ChevronDown className="h-5 w-5" /></Button>
            </div>
        </Reorder.Item>
    );
}

