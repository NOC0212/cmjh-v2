import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Shuffle, Trash2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Order() {
    const defaultContent = Array.from({ length: 30 }, (_, i) => (i + 1).toString()).join("\n");
    const [input, setInput] = useState(defaultContent);
    const [result, setResult] = useState<string[]>([]);
    const { toast } = useToast();

    const handleShuffle = () => {
        const lines = input
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

        if (lines.length === 0) {
            toast({
                title: "請輸入名單",
                description: "請在左側輸入至少一個名字",
                variant: "destructive",
            });
            return;
        }

        const shuffled = [...lines];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        setResult(shuffled);
    };

    const handleClear = () => {
        setInput("");
        setResult([]);
    };

    const handleCopy = () => {
        const text = result.join("\n");
        navigator.clipboard.writeText(text);
        toast({
            title: "已複製",
            description: "排序結果已複製到剪貼簿",
        });
    };

    return (
        <ToolLayout title="順序工具">
            <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <Card className="p-4 sm:p-5 space-y-3">
                        <h3 className="text-base sm:text-lg font-bold">名單輸入</h3>
                        <Textarea
                            placeholder="請輸入名單，每行一個"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="min-h-[200px] font-mono text-sm leading-relaxed resize-none"
                        />
                        <div className="flex gap-2">
                            <Button onClick={handleShuffle} className="flex-1 h-11">
                                <Shuffle className="mr-1.5 h-4 w-4" />
                                隨機排序
                            </Button>
                            <Button onClick={handleClear} variant="outline" className="h-11">
                                <Trash2 className="mr-1.5 h-4 w-4" />
                                清空
                            </Button>
                        </div>
                        <div className="text-xs text-muted-foreground/70">
                            {input.split("\n").filter((line) => line.trim().length > 0).length} 個項目
                        </div>
                    </Card>

                    <Card className="p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                                <Shuffle className="h-5 w-5 text-primary" />
                                排序結果
                                {result.length > 0 && (
                                    <span className="text-xs font-normal text-muted-foreground">{result.length} 項</span>
                                )}
                            </h3>
                            {result.length > 0 && (
                                <Button onClick={handleCopy} variant="outline" size="sm" className="text-xs h-8">
                                    <Copy className="mr-1 h-3.5 w-3.5" />
                                    複製
                                </Button>
                            )}
                        </div>

                        {result.length > 0 ? (
                            <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                                {result.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 text-sm font-medium truncate">{item}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-muted-foreground/50 border-2 border-dashed rounded-2xl">
                                <div className="text-center">
                                    <Shuffle className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">點擊「隨機排序」開始</p>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </ToolLayout>
    );
}
