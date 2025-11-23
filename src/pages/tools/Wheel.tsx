import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Target, Play, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Wheel() {
    const defaultContent = Array.from({ length: 30 }, (_, i) => (i + 1).toString()).join("\n");
    const [input, setInput] = useState(defaultContent);
    const [options, setOptions] = useState<string[]>([]);
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState<string>("");
    const [rotation, setRotation] = useState(0);
    const { toast } = useToast();

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
        if (options.length < 2) {
            toast({
                title: "請先設定選項",
                description: "點擊「確定」按鈕",
                variant: "destructive",
            });
            return;
        }

        setSpinning(true);
        setResult("");

        const randomSpins = 5 + Math.random() * 3;
        const randomAngle = Math.random() * 360;
        const totalRotation = rotation + randomSpins * 360 + randomAngle;

        setRotation(totalRotation);

        setTimeout(() => {
            const normalizedAngle = totalRotation % 360;
            const sectorAngle = 360 / options.length;
            const selectedIndex = Math.floor((360 - normalizedAngle) / sectorAngle) % options.length;

            setResult(options[selectedIndex]);
            setSpinning(false);
        }, 3000);
    };

    const handleClear = () => {
        setInput("");
        setOptions([]);
        setResult("");
        setRotation(0);
    };

    const colors = [
        "#3b82f6", "#ec4899", "#10b981", "#f59e0b",
        "#8b5cf6", "#ef4444", "#06b6d4", "#84cc16"
    ];

    return (
        <ToolLayout title="隨機抽籤輪盤">
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2 text-foreground">🎯 隨機抽籤輪盤</h2>
                    <p className="text-muted-foreground">轉動輪盤，隨機抽選幸運兒！</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 text-foreground">選項設定</h3>
                        <Textarea
                            placeholder="請輸入選項，每行一個&#10;例如：&#10;第一項&#10;第二項&#10;第三項"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="min-h-[200px] font-mono mb-4"
                            disabled={spinning}
                        />
                        <div className="flex gap-2">
                            <Button onClick={handleSetOptions} className="flex-1" disabled={spinning}>
                                <Plus className="mr-2 h-4 w-4" />
                                確定
                            </Button>
                            <Button onClick={handleClear} variant="outline" disabled={spinning}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                清空
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            {options.length > 0 ? `已設定 ${options.length} 個選項` : "尚未設定選項"}
                        </p>
                    </Card>

                    <Card className="p-6 flex flex-col items-center justify-center">
                        {options.length > 0 ? (
                            <div className="relative">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20">
                                    <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-red-500 drop-shadow-2xl" />
                                </div>

                                <div className="relative">
                                    <svg
                                        width="300"
                                        height="300"
                                        viewBox="0 0 300 300"
                                        className="drop-shadow-2xl"
                                        style={{
                                            transform: `rotate(${rotation}deg)`,
                                            transition: spinning ? "transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
                                        }}
                                    >
                                        <circle cx="150" cy="150" r="150" fill="white" />

                                        {options.map((option, index) => {
                                            const angle = 360 / options.length;
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
                                                    <path d={path} fill={color} stroke="white" strokeWidth="2" />
                                                    <text
                                                        x={textX}
                                                        y={textY}
                                                        fill="white"
                                                        fontSize="14"
                                                        fontWeight="bold"
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                        transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                                                    >
                                                        {option.length > 8 ? option.substring(0, 8) + "..." : option}
                                                    </text>
                                                </g>
                                            );
                                        })}

                                        <circle cx="150" cy="150" r="148" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                                    </svg>

                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white shadow-2xl flex items-center justify-center z-10 border-4 border-gray-300">
                                        <Target className="h-10 w-10 text-gray-600" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="w-64 h-64 flex items-center justify-center border-2 border-dashed rounded-full text-muted-foreground">
                                請先設定選項
                            </div>
                        )}

                        <Button
                            onClick={handleSpin}
                            disabled={spinning || options.length < 2}
                            size="lg"
                            className="mt-6 w-40"
                        >
                            {spinning ? (
                                <>旋轉中...</>
                            ) : (
                                <>
                                    <Play className="mr-2 h-5 w-5" />
                                    開始抽籤
                                </>
                            )}
                        </Button>

                        {result && (
                            <div className="mt-6 p-4 bg-primary/10 rounded-lg border-2 border-primary">
                                <div className="text-center">
                                    <div className="text-sm text-muted-foreground mb-1">抽中結果</div>
                                    <div className="text-3xl font-bold text-primary">🎉 {result}</div>
                                </div>
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
                        <li>• 預設已填入 1-30 的數字，可直接抽籤</li>
                        <li>• 在左側輸入選項，每行一個（至少 2 個）</li>
                        <li>• 點擊「確定」生成輪盤</li>
                        <li>• 點擊「開始抽籤」轉動輪盤</li>
                        <li>• 輪盤會自動停止並顯示結果</li>
                    </ul>
                </Card>
            </div>
        </ToolLayout>
    );
}
