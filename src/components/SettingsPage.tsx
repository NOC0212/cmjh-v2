import { Settings, ChevronUp, ChevronDown, Sun, Moon, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useComponentSettings } from "@/hooks/useComponentSettings";

// 主題預設值定義
const THEMES = [
    { name: "淺色", value: "light", icon: Sun },
    { name: "深色", value: "dark", icon: Moon },
    { name: "藍色", value: "blue", icon: Palette },
    { name: "綠色", value: "green", icon: Palette },
    { name: "橙色", value: "orange", icon: Palette },
    { name: "紅色", value: "red", icon: Palette },
    { name: "紫色", value: "purple", icon: Palette },
    { name: "漸層", value: "gradient", icon: Palette },
];

export function SettingsPage() {
    const { settings, toggleComponent, moveComponentUp, moveComponentDown, setTheme, resetToDefault, showAll } =
        useComponentSettings();

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

    // 取得分類後的組件清單
    const enabledComponents = settings.components
        .filter((c) => c.enabled)
        .sort((a, b) => a.order - b.order);

    const disabledComponents = settings.components.filter((c) => !c.enabled);

    return (
        <div className="space-y-6 text-foreground">
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
                                <span className="text-primary">📍</span>
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
                    <div className="space-y-2 bg-muted/30 rounded-lg p-3">
                        {enabledComponents.length > 0 ? (
                            enabledComponents.map((component, index) => (
                                <div
                                    key={component.id}
                                    className="flex items-center gap-2 bg-background rounded-md p-2 border border-border"
                                >
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
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">目前沒有啟用的組件</p>
                        )}
                    </div>
                </div>

                <Separator />

                {/* 未啟用的組件管理 */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                        <span className="text-muted-foreground">📍</span>
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

                {/* 主題切換區域 */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                        <span>🎨</span>
                        主題設定
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {THEMES.map((theme) => {
                            const Icon = theme.icon;
                            const isActive = settings.theme === theme.value;
                            return (
                                <Button
                                    key={theme.value}
                                    variant={isActive ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setTheme(theme.value)}
                                    className="justify-start gap-2 text-foreground data-[state=active]:text-background"
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{theme.name}</span>
                                    {isActive && <div className="ml-auto w-2 h-2 rounded-full bg-background" />}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
