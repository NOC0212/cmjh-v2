import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";

export default function Clock() {
    const [time, setTime] = useState(new Date());
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const hours = time.getHours().toString().padStart(2, "0");
    const minutes = time.getMinutes().toString().padStart(2, "0");
    const seconds = time.getSeconds().toString().padStart(2, "0");

    const year = time.getFullYear();
    const month = (time.getMonth() + 1).toString().padStart(2, "0");
    const date = time.getDate().toString().padStart(2, "0");
    const weekday = ["日", "一", "二", "三", "四", "五", "六"][time.getDay()];

    return (
        <ToolLayout title="時鐘">
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">🕐 時鐘</h2>
                    <p className="text-muted-foreground">實時顯示當前時間</p>
                </div>

                {/* 主時鐘 */}
                <Card className="p-8 md:p-12 text-center bg-gradient-to-br from-primary/5 to-accent/5">
                    <div className="space-y-6">
                        {/* 時間顯示 */}
                        <div className="font-mono">
                            <div className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                {hours}:{minutes}:{seconds}
                            </div>
                            <div className="text-2xl md:text-3xl text-muted-foreground mt-4">
                                {year}年{month}月{date}日 星期{weekday}
                            </div>
                        </div>

                        {/* 全螢幕按鈕 */}
                        <Button onClick={toggleFullscreen} variant="outline" size="lg">
                            {isFullscreen ? (
                                <>
                                    <Minimize2 className="mr-2 h-4 w-4" />
                                    退出全螢幕
                                </>
                            ) : (
                                <>
                                    <Maximize2 className="mr-2 h-4 w-4" />
                                    全螢幕顯示
                                </>
                            )}
                        </Button>
                    </div>
                </Card>

                {/* 其他時區（可選） */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4 text-center">
                        <div className="text-sm text-muted-foreground mb-2">台北</div>
                        <div className="text-2xl font-bold font-mono">
                            {hours}:{minutes}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">UTC+8</div>
                    </Card>

                    <Card className="p-4 text-center">
                        <div className="text-sm text-muted-foreground mb-2">東京</div>
                        <div className="text-2xl font-bold font-mono">
                            {new Date(time.getTime() + 1 * 60 * 60 * 1000)
                                .getHours()
                                .toString()
                                .padStart(2, "0")}
                            :
                            {new Date(time.getTime() + 1 * 60 * 60 * 1000)
                                .getMinutes()
                                .toString()
                                .padStart(2, "0")}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">UTC+9</div>
                    </Card>

                    <Card className="p-4 text-center">
                        <div className="text-sm text-muted-foreground mb-2">紐約</div>
                        <div className="text-2xl font-bold font-mono">
                            {new Date(time.getTime() - 13 * 60 * 60 * 1000)
                                .getHours()
                                .toString()
                                .padStart(2, "0")}
                            :
                            {new Date(time.getTime() - 13 * 60 * 60 * 1000)
                                .getMinutes()
                                .toString()
                                .padStart(2, "0")}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">UTC-5</div>
                    </Card>
                </div>

                {/* 使用說明 */}
                <Card className="p-6 bg-primary/5 border-primary/20">
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <span>💡</span>
                        功能說明
                    </h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• 顯示當前台北時間（每秒更新）</li>
                        <li>• 顯示完整日期和星期</li>
                        <li>• 可切換全螢幕模式</li>
                        <li>• 附帶其他時區時間參考</li>
                    </ul>
                </Card>
            </div>
        </ToolLayout>
    );
}
