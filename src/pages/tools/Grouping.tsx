import { useState } from "react";
import { ToolLayout } from "./ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Users, Shuffle, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

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

        const shuffled = [...lines];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        const groups: string[][] = [];

        if (groupType === "count") {
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
            <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                    <Card className="lg:col-span-5 p-4 sm:p-5 space-y-4">
                        <h3 className="text-base sm:text-lg font-bold">名單輸入</h3>
                        <Textarea
                            placeholder="請輸入名單，每行一個"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="min-h-[180px] font-mono text-sm leading-relaxed resize-none"
                        />
                        <div className="text-xs text-muted-foreground/70 flex items-center justify-between">
                            <span>每行一個項目</span>
                            <span className="font-medium">
                                {input.split("\n").filter((line) => line.trim().length > 0).length} 個項目
                            </span>
                        </div>

                        <div className="space-y-3 pt-1">
                            {/* 原生 radio（品牌色 accent） */}
                            <div
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl border transition-colors",
                                    groupType === "count"
                                        ? "bg-primary/5 border-primary/30"
                                        : "bg-muted/30 border-border/40"
                                )}
                            >
                                <input
                                    type="radio"
                                    name="groupType"
                                    value="count"
                                    id="count"
                                    checked={groupType === "count"}
                                    onChange={() => setGroupType("count")}
                                    className="h-4 w-4 shrink-0 accent-[hsl(var(--primary))]"
                                />
                                <Label htmlFor="count" className="flex items-center gap-2 flex-1 cursor-pointer text-sm">
                                    分成
                                    <Input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={groupCount}
                                        onChange={(e) => setGroupCount(Number(e.target.value))}
                                        className="w-16 h-8 text-center text-sm"
                                        onClick={() => setGroupType("count")}
                                    />
                                    組
                                </Label>
                            </div>
                            <div
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl border transition-colors",
                                    groupType === "size"
                                        ? "bg-primary/5 border-primary/30"
                                        : "bg-muted/30 border-border/40"
                                )}
                            >
                                <input
                                    type="radio"
                                    name="groupType"
                                    value="size"
                                    id="size"
                                    checked={groupType === "size"}
                                    onChange={() => setGroupType("size")}
                                    className="h-4 w-4 shrink-0 accent-[hsl(var(--primary))]"
                                />
                                <Label htmlFor="size" className="flex items-center gap-2 flex-1 cursor-pointer text-sm">
                                    每組
                                    <Input
                                        type="number"
                                        min="1"
                                        max="50"
                                        value={groupSize}
                                        onChange={(e) => setGroupSize(Number(e.target.value))}
                                        className="w-16 h-8 text-center text-sm"
                                        onClick={() => setGroupType("size")}
                                    />
                                    人
                                </Label>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-1">
                            <Button onClick={handleGroup} className="flex-1 h-11">
                                <Shuffle className="mr-1.5 h-4 w-4" />
                                開始分組
                            </Button>
                            <Button onClick={handleClear} variant="outline" className="h-11">
                                <Trash2 className="mr-1.5 h-4 w-4" />
                                清空
                            </Button>
                        </div>
                    </Card>

                    <Card className="lg:col-span-7 p-4 sm:p-5">
                        <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            分組結果
                            {result.length > 0 && (
                                <span className="text-xs font-normal text-muted-foreground ml-1">
                                    {result.reduce((sum, g) => sum + g.length, 0)} 人 · {result.length} 組
                                </span>
                            )}
                        </h3>

                        {result.length > 0 ? (
                            <div className="grid sm:grid-cols-2 gap-3">
                                {result.map((group, groupIndex) => (
                                    <div
                                        key={groupIndex}
                                        className="rounded-2xl border border-primary/20 bg-brand-soft p-4"
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                                {groupIndex + 1}
                                            </div>
                                            <span className="text-sm font-semibold">第 {groupIndex + 1} 組</span>
                                            <span className="text-xs text-muted-foreground ml-auto">{group.length} 人</span>
                                        </div>
                                        <div className="space-y-1.5">
                                            {group.map((member, memberIndex) => (
                                                <div key={memberIndex} className="flex items-center gap-2 text-sm p-2 bg-background/60 rounded-lg">
                                                    <span className="text-muted-foreground/50 text-xs w-4 text-right shrink-0">{memberIndex + 1}.</span>
                                                    <span>{member}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-16 text-center text-muted-foreground/50 border-2 border-dashed rounded-2xl">
                                <Users className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">輸入名單後點擊「開始分組」</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </ToolLayout>
    );
}
