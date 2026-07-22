import { useState, useEffect, useMemo } from "react";
import { useSettings } from "@/hooks/SettingsContext";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Target, Play, Trash2, Plus, History, XCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface HistoryItem {
    id: string;
    result: string;
    timestamp: number;
}

export default function Wheel() {
    const defaultContent = Array.from({ length: 30 }, (_, i) => (i + 1).toString()).join("\n");
    const [input, setInput] = useState(defaultContent);
    const [options, setOptions] = useState<string[]>([]);
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState<string>("");
    const [rotation, setRotation] = useState(0);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [excludeDrawn, setExcludeDrawn] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const savedHistory = localStorage.getItem("wheel_history");
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error("Failed to parse wheel history");
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("wheel_history", JSON.stringify(history));
    }, [history]);

    const handleSetOptions = () => {
        const lines = input
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

        if (lines.length < 2) {
            toast({
                title: "選項不足",
                description: "請至少輸入 2 個選項",
                variant: "destructive",
            });
            return;
        }

        setOptions(lines);
        setResult("");
        toast({
            title: "設定完成",
            description: `已設定 ${lines.length} 個選項`,
        });
    };

    const handleSpin = () => {
        const currentOptions = excludeDrawn
            ? options.filter(opt => !history.some(h => h.result === opt))
            : options;

        if (currentOptions.length < 2) {
            toast({
                title: excludeDrawn ? "可抽選項不足" : "請先設定選項",
                description: excludeDrawn ? "所有選項皆已抽過，請清除歷史紀錄或關閉排除功能。" : "點擊「確定」按鈕",
                variant: "destructive",
            });
            return;
        }

        setSpinning(true);
        setResult("");

        const randomSpins = 6 + Math.random() * 4;
        const randomAngle = Math.random() * 360;
        const totalRotation = rotation + randomSpins * 360 + randomAngle;

        setRotation(totalRotation);

        const spinDuration = 4500;
        setTimeout(() => {
            const normalizedAngle = totalRotation % 360;
            const sectorAngle = 360 / currentOptions.length;
            const selectedIndex = Math.floor((360 - normalizedAngle) / sectorAngle) % currentOptions.length;
            const selectedResult = currentOptions[selectedIndex];

            setResult(selectedResult);
            setSpinning(false);

            const newItem: HistoryItem = {
                id: Math.random().toString(36).substr(2, 9),
                result: selectedResult,
                timestamp: Date.now(),
            };
            setHistory(prev => [newItem, ...prev]);

        }, spinDuration);
    };

    const handleClear = () => {
        setInput("");
        setOptions([]);
        setResult("");
        setRotation(0);
    };

    const clearHistory = () => {
        setHistory([]);
        toast({
            title: "歷史紀錄已清除",
        });
    };

    const { settings } = useSettings();

    const colors = useMemo(() => {
        const getCSSVar = (name: string): string =>
            getComputedStyle(document.documentElement).getPropertyValue(name).trim();

        const primaryHsl = getCSSVar('--primary');
        const parts = primaryHsl ? primaryHsl.split(' ').filter(Boolean) : [];
        const baseHue = parts.length >= 1 && parts[0] ? parseInt(parts[0], 10) || 210 : 210;
        const baseSat = parts.length >= 2 && parts[1] ? parseInt(parts[1], 10) || 75 : 75;

        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const isDark = settings.themeMode === "dark" || (settings.themeMode === "system" && prefersDark);
        const lightness = isDark ? 55 : 48;

        return Array.from({ length: 12 }, (_, i) => {
            const hue = (baseHue + i * 30) % 360;
            const sat = Math.max(55, Math.min(90, baseSat - (i % 3) * 8));
            const light = lightness + (i % 2 === 0 ? 8 : -5);
            return `hsl(${hue}, ${sat}%, ${light}%)`;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settings.themeColor, settings.themeMode]);

    const effectiveOptions = excludeDrawn
        ? options.filter(opt => !history.some(h => h.result === opt))
        : options;

    return (
        <ToolLayout title="隨機抽籤輪盤">
            <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                    <Card className="lg:col-span-8 p-4 sm:p-6 flex flex-col items-center justify-center min-h-[400px] sm:min-h-[500px]">
                        {effectiveOptions.length > 0 ? (
                            <div className="relative flex flex-col items-center">
                                <div className="relative">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-20">
                                        <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-destructive drop-shadow-2xl" />
                                    </div>

                                    <svg
                                        width="400"
                                        height="400"
                                        viewBox="0 0 300 300"
                                        className="drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] max-w-[320px] sm:max-w-[400px] w-full h-auto"
                                        style={{
                                            transform: `rotate(${rotation}deg)`,
                                            transition: spinning ? "transform 4.5s cubic-bezier(0.12, 0.75, 0.1, 1)" : "none",
                                        }}
                                    >
                                        <circle cx="150" cy="150" r="150" fill="white" />

                                        {effectiveOptions.map((option, index) => {
                                            const angle = 360 / effectiveOptions.length;
                                            const startAngle = angle * index - 90;
                                            const endAngle = startAngle + angle;

                                            const startRad = (startAngle * Math.PI) / 180;
                                            const endRad = (endAngle * Math.PI) / 180;

                                            const x1 = 150 + 140 * Math.cos(startRad);
                                            const y1 = 150 + 140 * Math.sin(startRad);
                                            const x2 = 150 + 140 * Math.cos(endRad);
                                            const y2 = 150 + 140 * Math.sin(endRad);

                                            const largeArc = angle > 180 ? 1 : 0;
                                            const path = `M 150 150 L ${x1} ${y1} A 140 140 0 ${largeArc} 1 ${x2} ${y2} Z`;

                                            const color = colors[index % colors.length];

                                            const textAngle = startAngle + angle / 2;
                                            const textRad = (textAngle * Math.PI) / 180;
                                            const textX = 150 + 90 * Math.cos(textRad);
                                            const textY = 150 + 90 * Math.sin(textRad);

                                            return (
                                                <g key={index}>
                                                    <path d={path} fill={color} stroke="white" strokeWidth="1" />
                                                    <text
                                                        x={textX}
                                                        y={textY}
                                                        fill="white"
                                                        fontSize={effectiveOptions.length > 20 ? "7" : "11"}
                                                        fontWeight="bold"
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                        transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                                                    >
                                                        {option.length > 8 ? option.substring(0, 8) + "…" : option}
                                                    </text>
                                                </g>
                                            );
                                        })}
                                        <circle cx="150" cy="150" r="148" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                                    </svg>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-background shadow-2xl flex items-center justify-center z-10 border-4 border-border">
                                        <Target className="h-7 w-7 sm:h-10 sm:w-10 text-primary/70" />
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-3 mt-6 w-full max-w-md">
                                    <Button
                                        onClick={handleSpin}
                                        disabled={spinning || effectiveOptions.length < 2}
                                        size="lg"
                                        className="w-full h-12 sm:h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
                                    >
                                        {spinning ? "抽籤中…" : (
                                            <><Play className="mr-2 h-5 w-5" />開始隨機抽籤</>
                                        )}
                                    </Button>

                                    {result && (
                                        <div className="w-full p-4 sm:p-5 bg-primary/10 rounded-2xl border-2 border-primary animate-in zoom-in duration-500">
                                            <div className="text-center">
                                                <div className="text-xs text-muted-foreground mb-1">抽中結果</div>
                                                <div className="text-3xl sm:text-4xl font-black text-primary truncate">{result}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center border-2 border-dashed rounded-full text-muted-foreground text-center p-8 text-sm sm:text-base">
                                {excludeDrawn && options.length > 0 ? "所有選項已排除，請清除歷史紀錄" : "請先在右側設定選項並點擊確定"}
                            </div>
                        )}
                    </Card>

                    <Card className="lg:col-span-4 p-4 sm:p-5 space-y-3 sm:space-y-4 flex flex-col">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                            <h3 className="text-base sm:text-lg font-bold">名單設定</h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setExcludeDrawn(!excludeDrawn)}
                                className={cn(
                                    "text-xs gap-1.5 h-8",
                                    excludeDrawn ? "bg-primary/10 text-primary border-primary/30" : "text-muted-foreground"
                                )}
                            >
                                {excludeDrawn ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                                {excludeDrawn ? "已排除中獎" : "排除已中獎"}
                            </Button>
                        </div>
                        <div className="text-[11px] text-muted-foreground/70 leading-relaxed">
                            輸入名單，每行一個項目，至少 2 個項目
                        </div>
                        <Textarea
                            placeholder="請在此輸入名單，每行一個…"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 min-h-[200px] sm:min-h-[280px] font-mono text-sm leading-relaxed resize-none"
                            disabled={spinning}
                        />
                        <div className="flex gap-2">
                            <Button onClick={handleSetOptions} className="flex-1 h-11" disabled={spinning}>
                                <Plus className="mr-1.5 h-4 w-4" />
                                確定名單
                            </Button>
                            <Button onClick={handleClear} variant="ghost" size="icon" className="h-11 w-11 shrink-0" disabled={spinning}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="text-[11px] text-muted-foreground/60 italic">
                            共 {options.length || input.split("\n").filter(l => l.trim()).length} 個項目
                            {excludeDrawn && options.length > 0 && ` · ${effectiveOptions.length} 個可抽`}
                        </div>
                    </Card>

                    <Card className="lg:col-span-full p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                                <History className="h-5 w-5 text-primary" />
                                抽籤紀錄
                                {history.length > 0 && (
                                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-normal">
                                        {history.length}
                                    </span>
                                )}
                            </h3>
                            {history.length > 0 && (
                                <Button variant="outline" size="sm" onClick={clearHistory} className="text-destructive hover:bg-destructive/10 text-xs h-8">
                                    清除紀錄
                                </Button>
                            )}
                        </div>

                        {history.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                                {history.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className={cn(
                                            "p-3 rounded-xl border text-center transition-all",
                                            index === 0
                                                ? "bg-primary/10 border-primary ring-2 ring-primary/20 scale-105 z-10"
                                                : "bg-card hover:border-primary/30 border-border/50"
                                        )}
                                    >
                                        <div className={cn(
                                            "text-sm font-bold truncate",
                                            index === 0 ? "text-primary" : "text-foreground"
                                        )}>
                                            {item.result}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground/60 mt-0.5">
                                            {new Date(item.timestamp).toLocaleTimeString([], { hour12: false })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center text-muted-foreground/50 border-2 border-dashed rounded-2xl">
                                <History className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">尚未有抽籤紀錄</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </ToolLayout>
    );
}


