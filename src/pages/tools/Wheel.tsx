import { useState, useEffect, useMemo } from "react";
import { useSettings } from "@/hooks/SettingsContext";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Target, Play, Trash2, Plus, History, XCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

    // 載入歷史紀錄
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

    // 儲存歷史紀錄
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
        // 過濾已抽中的選項 (如果開啟排除功能)
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

    // 從當前主題 CSS 變數中產生轉盤配色
    const colors = useMemo(() => {
        const getCSSVar = (name: string): string =>
            getComputedStyle(document.documentElement).getPropertyValue(name).trim();

        const primaryHsl = getCSSVar('--primary');
        const parts = primaryHsl.split(' ').filter(Boolean);
        const baseHue = parts.length >= 1 ? parseInt(parts[0], 10) : 210;
        const baseSat = parts.length >= 2 ? parseInt(parts[1], 10) : 75;

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

    // 計算目前有效的選項內容 (用於轉盤顯示)
    const effectiveOptions = excludeDrawn
        ? options.filter(opt => !history.some(h => h.result === opt))
        : options;

    return (
        <ToolLayout title="隨機抽籤輪盤">
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2 text-foreground flex items-center justify-center gap-2">
                        <Target className="h-8 w-8 text-primary" />
                        隨機抽籤輪盤
                    </h2>
                    <p className="text-muted-foreground">轉動輪盤，隨機抽選幸運兒！</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* 左側：轉盤 (佔據較大空間) */}
                    <Card className="lg:col-span-8 p-6 flex flex-col items-center justify-center min-h-[500px]">
                        {effectiveOptions.length > 0 ? (
                            <div className="relative">
                                {/* 箭頭指標 */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20">
                                    <div className="w-0 h-0 border-l-[25px] border-l-transparent border-r-[25px] border-r-transparent border-t-[50px] border-t-red-500 drop-shadow-2xl" />
                                </div>

                                <div className="relative">
                                    <svg
                                        width="450"
                                        height="450"
                                        viewBox="0 0 300 300"
                                        className="drop-shadow-[0_20px_50px_rgba(0,0,0,0.2)] max-w-full h-auto"
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
                                                        fontSize={effectiveOptions.length > 20 ? "8" : "12"}
                                                        fontWeight="bold"
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                        transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                                                    >
                                                        {option.length > 10 ? option.substring(0, 10) + "..." : option}
                                                    </text>
                                                </g>
                                            );
                                        })}
                                        <circle cx="150" cy="150" r="148" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                                    </svg>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white shadow-2xl flex items-center justify-center z-10 border-4 border-gray-100">
                                        <Target className="h-10 w-10 text-primary/80" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="w-80 h-80 flex items-center justify-center border-2 border-dashed rounded-full text-muted-foreground text-center p-8 text-lg">
                                {excludeDrawn && options.length > 0 ? "所有選項已排除\n請清除歷史紀錄" : "請先在右側設定選項並點擊確定"}
                            </div>
                        )}

                        <div className="flex flex-col items-center gap-4 mt-8 w-full max-w-md">
                            <Button
                                onClick={handleSpin}
                                disabled={spinning || effectiveOptions.length < 2}
                                size="lg"
                                className="w-full h-16 text-xl font-bold shadow-lg hover:shadow-xl transition-all"
                            >
                                {spinning ? "抽籤中..." : (
                                    <><Play className="mr-3 h-6 w-6" />開始隨機抽籤</>
                                )}
                            </Button>

                            {result && (
                                <div className="w-full p-6 bg-primary/10 rounded-2xl border-2 border-primary animate-in zoom-in duration-500 shadow-inner">
                                    <div className="text-center">
                                        <div className="text-sm text-muted-foreground mb-2">抽中結果</div>
                                        <div className="text-4xl font-black text-primary truncate drop-shadow-sm">🎉 {result}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* 右側：名單設定 */}
                    <Card className="lg:col-span-4 p-6 space-y-4 flex flex-col">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-foreground">名單設定</h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setExcludeDrawn(!excludeDrawn)}
                                className={excludeDrawn ? "bg-primary/10 text-primary border-primary/30" : "text-muted-foreground"}
                            >
                                {excludeDrawn ? (
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                ) : (
                                    <XCircle className="h-4 w-4 mr-2" />
                                )}
                                排除已中獎
                            </Button>
                        </div>
                        <Textarea
                            placeholder="請在此輸入名單，每行一個..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 min-h-[300px] font-mono text-base mb-2 leading-relaxed"
                            disabled={spinning}
                        />
                        <div className="flex gap-3">
                            <Button onClick={handleSetOptions} className="flex-1 h-12" disabled={spinning}>
                                <Plus className="mr-2 h-5 w-5" />
                                確定名單
                            </Button>
                            <Button onClick={handleClear} variant="ghost" className="h-12" disabled={spinning}>
                                <Trash2 className="h-5 w-5" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground italic">
                            提示：更改名單後務必點擊「確定名單」按鈕。
                        </p>
                    </Card>

                    {/* 下方：歷史紀錄 (Full Width) */}
                    <Card className="lg:col-span-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
                                <History className="h-6 w-6 text-primary" />
                                抽籤歷史紀錄
                                <span className="bg-muted px-2.5 py-0.5 rounded-full text-xs font-medium text-muted-foreground">
                                    {history.length}
                                </span>
                            </h3>
                            {history.length > 0 && (
                                <Button variant="outline" size="sm" onClick={clearHistory} className="text-destructive hover:bg-destructive/10">
                                    清除所有紀錄
                                </Button>
                            )}
                        </div>

                        {history.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {history.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${index === 0
                                                ? 'bg-primary/10 border-primary ring-2 ring-primary/20 scale-105 z-10'
                                                : 'bg-card hover:border-muted-foreground/30 shadow-sm'
                                            }`}
                                    >
                                        <span className={`text-lg font-bold truncate w-full text-center ${index === 0 ? 'text-primary' : 'text-foreground'}`}>
                                            {index === 0 && <span className="mr-1">✨</span>}
                                            {item.result}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground opacity-70">
                                            {new Date(item.timestamp).toLocaleTimeString([], { hour12: false })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center text-muted-foreground border-2 border-dashed rounded-2xl">
                                <History className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p className="italic">尚未有抽籤紀錄，快開始第一次抽獎吧！</p>
                            </div>
                        )}
                    </Card>
                </div>

                <Card className="p-6 bg-primary/5 border-primary/20">
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-foreground">
                        <span>💡</span>
                        使用說明
                    </h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <b>排除已中獎</b>：開啟後，已抽中的項目將不會再次出現在轉盤中。</li>
                        <li>• <b>歷史紀錄</b>：系統會自動保存本次的抽籤結果，並持久化存儲於瀏覽器中。</li>
                        <li>• <b>設定選項</b>：在左側輸入後點擊「確定」即可更新轉盤，支援快速輸入大量名單。</li>
                    </ul>
                </Card>
            </div>
        </ToolLayout>
    );
}
