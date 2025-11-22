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

        // Fisher-Yates 洗牌演算法
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
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">🔀 順序工具</h2>
                    <p className="text-muted-foreground">隨機排列名單順序</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* 輸入區 */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">名單輸入</h3>
                        <Textarea
                            placeholder="請輸入名單，每行一個&#10;例如：&#10;第一項&#10;第二項&#10;第三項"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="min-h-[300px] font-mono"
                        />
                        <div className="mt-4 flex gap-2">
                            <Button onClick={handleShuffle} className="flex-1">
                                <Shuffle className="mr-2 h-4 w-4" />
                                隨機排序
                            </Button>
                            <Button onClick={handleClear} variant="outline">
                                <Trash2 className="mr-2 h-4 w-4" />
                                清空
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            共 {input.split("\n").filter((line) => line.trim().length > 0).length} 個項目
                        </p>
                    </Card>

                    {/* 結果區 */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">排序結果</h3>
                            {result.length > 0 && (
                                <Button onClick={handleCopy} variant="outline" size="sm">
                                    <Copy className="mr-2 h-4 w-4" />
                                    複製
                                </Button>
                            )}
                        </div>

                        {result.length > 0 ? (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {result.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                                    >
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 font-medium">{item}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                                點擊「隨機排序」開始
                            </div>
                        )}
                    </Card>
                </div>

                {/* 使用說明 */}
                <Card className="p-6 bg-primary/5 border-primary/20">
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <span>💡</span>
                        使用說明
                    </h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• 預設已填入 1-30 的數字，可直接排序</li>
                        <li>• 在左側輸入框中輸入名單，每行一個名字</li>
                        <li>• 點擊「隨機排序」按鈕進行排序</li>
                        <li>• 右側會顯示隨機排列後的結果</li>
                        <li>• 可以點擊「複製」按鈕複製結果</li>
                    </ul>
                </Card>
            </div>
        </ToolLayout>
    );
}
