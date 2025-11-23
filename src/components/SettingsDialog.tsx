import { useState } from "react";
import { Settings, ChevronUp, ChevronDown, Sun, Moon, Palette } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useComponentSettings } from "@/hooks/useComponentSettings";

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

export function SettingsDialog() {
    const [open, setOpen] = useState(false);
    const { settings, toggleComponent, moveComponentUp, moveComponentDown, setTheme, resetToDefault, showAll } =
        useComponentSettings();

    const handleCheckboxChange = (id: string, checked: boolean) => {
        toggleComponent(id);
    };

    const handleShowAll = () => {
        showAll();
    };

    const handleReset = () => {
        resetToDefault();
    };

    const handleComplete = () => {
        setOpen(false);
        setTimeout(() => {
            window.location.reload();
        }, 100);
    };

    const enabledComponents = settings.components
        .filter((c) => c.enabled)
        .sort((a, b) => a.order - b.order);

    const disabledComponents = settings.components.filter((c) => !c.enabled);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">設定</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>組件與主題設定</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                                    <span className="text-primary">📍</span>
                                    已啟用的組件
                                </h3>
                                <p className="text-xs text-muted-foreground">可調整顯示順序</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={handleShowAll}>
                                    全選
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleReset}>
                                    重置
                                </Button>
                                <Button size="sm" onClick={handleComplete}>
                                    完成
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
                                            onCheckedChange={(checked) => handleCheckboxChange(component.id, checked === true)}
                                        />
                                        <Label htmlFor={`enabled-${component.id}`} className="flex-1 text-sm font-medium cursor-pointer">
                                            {component.label}
                                        </Label>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => moveComponentUp(component.id)}
                                                disabled={index === 0}
                                                title="上移"
                                            >
                                                <ChevronUp className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => moveComponentDown(component.id)}
                                                disabled={index === enabledComponents.length - 1}
                                                title="下移"
                                            >
                                                <ChevronDown className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">沒有已啟用的組件</p>
                            )}
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
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
                                            onCheckedChange={(checked) => handleCheckboxChange(component.id, checked === true)}
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
                                <p className="text-sm text-muted-foreground text-center py-2">全部組件已啟用</p>
                            )}
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                            <span>🎨</span>
                            主題設定
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            {THEMES.map((theme) => {
                                const Icon = theme.icon;
                                const isActive = settings.theme === theme.value;
                                return (
                                    <Button
                                        key={theme.value}
                                        variant={isActive ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setTheme(theme.value)}
                                        className="justify-start gap-2"
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
            </DialogContent>
        </Dialog>
    );
}
