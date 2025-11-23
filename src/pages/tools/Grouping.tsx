import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Users, Shuffle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Grouping() {
    const defaultContent = Array.from({ length: 30 }, (_, i) => (i + 1).toString()).join("\n");
    const [input, setInput] = useState(defaultContent);
    const [groupType, setGroupType] = useState<"count" | "size">("count");
    const [groupCount, setGroupCount] = useState(3);
    const [groupSize, setGroupSize] = useState(5);
    const [result, setResult] = useState<string[][]>([]);
    const { toast } = useToast();

    const handleGroup = () => {
        const lines = input
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

        if (lines.length === 0) {
            toast({
                title: "請輸入名單",
                description: "請在上方輸入至少一個名字",
                variant: "destructive",
            });
            return;
        }

        // 洗牌
        const shuffled = [...lines];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // 分組
        const groups: string[][] = [];

        if (groupType === "count") {
            // 按組數分組
            const actualGroupCount = Math.min(groupCount, shuffled.length);
            const baseSize = Math.floor(shuffled.length / actualGroupCount);
            const remainder = shuffled.length % actualGroupCount;

            let index = 0;
            for (let i = 0; i < actualGroupCount; i++) {
                const size = baseSize + (i < remainder ? 1 : 0);
                groups.push(shuffled.slice(index, index + size));
                index += size;
            }
        } else {
            // 按每組人數分組
            for (let i = 0; i < shuffled.length; i += groupSize) {
                groups.push(shuffled.slice(i, i + groupSize));
            }
        }

        setResult(groups);
    };

    const handleClear = () => {
        setInput("");
        setResult([]);
    };

    return (
        <ToolLayout title="分組工具">
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2 text-foreground">👥 分組工具</h2>
                    <p className="text-muted-foreground">快速將名單分成多個小組</p>
                </div>

                {/* 輸入區 */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-foreground">名單輸入</h3>
                    <Textarea
                        placeholder="請輸入名單，每行一個&#10;例如：&#10;第一項&#10;第二項&#10;第三項"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="min-h-[150px] font-mono"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                        共 {input.split("\n").filter((line) => line.trim().length > 0).length} 個項目
                    </p>
                </Card>

                {/* 分組設定 */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-foreground">分組設定</h3>
                    <RadioGroup value={groupType} onValueChange={(value) => setGroupType(value as "count" | "size")}>
                        <div className="flex items-center space-x-2 mb-4">
                            <RadioGroupItem value="count" id="count" />
                            <Label htmlFor="count" className="flex items-center gap-2 flex-1 cursor-pointer">
                                分成
                                <Input
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={groupCount}
                                    onChange={(e) => setGroupCount(Number(e.target.value))}
                                    className="w-20 text-center"
                                    onClick={() => setGroupType("count")}
                                />
                                組
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="size" id="size" />
                            <Label htmlFor="size" className="flex items-center gap-2 flex-1 cursor-pointer">
                                每組
                                <Input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={groupSize}
                                    onChange={(e) => setGroupSize(Number(e.target.value))}
                                    className="w-20 text-center"
                                    onClick={() => setGroupType("size")}
                                />
                                人
                            </Label>
                        </div>
                    </RadioGroup>

                    <div className="mt-6 flex gap-2">
                        <Button onClick={handleGroup} className="flex-1">
                            <Shuffle className="mr-2 h-4 w-4" />
                            開始分組
                        </Button>
                        <Button onClick={handleClear} variant="outline">
                            <Trash2 className="mr-2 h-4 w-4" />
                            清空
                        </Button>
                    </div>
                </Card>

                {/* 結果顯示 */}
                {result.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                            <Users className="h-5 w-5" />
                            分組結果（共 {result.length} 組）
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {result.map((group, groupIndex) => (
                                <Card key={groupIndex} className="p-4">
                                    <div className="font-semibold mb-3 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                                            {groupIndex + 1}
                                        </div>
                                        第 {groupIndex + 1} 組（{group.length} 人）
                                    </div>
                                    <div className="space-y-2">
                                        {group.map((member, memberIndex) => (
                                            <div key={memberIndex} className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded">
                                                <span className="text-muted-foreground">{memberIndex + 1}.</span>
                                                <span>{member}</span>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* 使用說明 */}
                <Card className="p-6 bg-primary/5 border-primary/20">
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-foreground">
                        <span>💡</span>
                        使用說明
                    </h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• 預設已填入 1-30 的數字，可直接分組</li>
                        <li>• 在上方輸入框中輸入名單，每行一個名字</li>
                        <li>• 選擇「分成 N 組」或「每組 N 人」</li>
                        <li>• 點擊「開始分組」進行隨機分組</li>
                        <li>• 分組結果會自動打亂順序</li>
                    </ul>
                </Card>
            </div>
        </ToolLayout>
    );
}
