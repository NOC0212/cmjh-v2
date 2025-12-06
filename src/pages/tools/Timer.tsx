import { useState, useEffect, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, RotateCcw } from "lucide-react";

export default function Timer() {
    const [mode, setMode] = useState<"countdown" | "stopwatch">("countdown");

    // 倒數計時器狀態
    const [minutes, setMinutes] = useState(5);
    const [seconds, setSeconds] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isCountdownRunning, setIsCountdownRunning] = useState(false);

    // 碼表狀態
    const [stopwatchTime, setStopwatchTime] = useState(0);
    const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // 倒數計時器邏輯
    useEffect(() => {
        if (!isCountdownRunning || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isCountdownRunning]);

    // 處理倒數計時結束
    useEffect(() => {
        if (timeLeft === 0 && isCountdownRunning) {
            setIsCountdownRunning(false);
            if (audioRef.current) {
                audioRef.current.play().catch((error) => {
                    console.error("Failed to play audio:", error);
                });
            }
        }
    }, [timeLeft, isCountdownRunning]);

    // 碼表邏輯
    useEffect(() => {
        if (isStopwatchRunning) {
            const timer = setInterval(() => {
                setStopwatchTime((prev) => prev + 10);
            }, 10);

            return () => clearInterval(timer);
        }
    }, [isStopwatchRunning]);

    // 倒數計時器控制
    const handleCountdownStart = () => {
        if (timeLeft === 0) {
            const totalSeconds = minutes * 60 + seconds;
            if (totalSeconds > 0) {
                setTimeLeft(totalSeconds);
                setIsCountdownRunning(true);
            }
        } else {
            setIsCountdownRunning(true);
        }
    };

    const handleCountdownPause = () => {
        setIsCountdownRunning(false);
    };

    const handleCountdownReset = () => {
        setIsCountdownRunning(false);
        setTimeLeft(0);
    };

    // 碼表控制
    const handleStopwatchStart = () => {
        setIsStopwatchRunning(true);
    };

    const handleStopwatchPause = () => {
        setIsStopwatchRunning(false);
    };

    const handleStopwatchReset = () => {
        setIsStopwatchRunning(false);
        setStopwatchTime(0);
    };

    // 格式化顯示
    const displayMinutes = Math.floor(timeLeft / 60);
    const displaySeconds = timeLeft % 60;
    const progress = timeLeft > 0 ? (timeLeft / (minutes * 60 + seconds)) * 100 : 0;

    const stopwatchMinutes = Math.floor(stopwatchTime / 60000);
    const stopwatchSeconds = Math.floor((stopwatchTime % 60000) / 1000);
    const stopwatchMillis = Math.floor((stopwatchTime % 1000) / 10);

    return (
        <ToolLayout title="計時器">
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2 text-foreground">⏱️ 計時器 / 碼表</h2>
                    <p className="text-muted-foreground">倒數計時或正數碼表</p>
                </div>

                {/* 模式切換 */}
                <Tabs value={mode} onValueChange={(v) => setMode(v as "countdown" | "stopwatch")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="countdown">倒數計時</TabsTrigger>
                        <TabsTrigger value="stopwatch">碼表</TabsTrigger>
                    </TabsList>

                    {/* 倒數計時器 */}
                    <TabsContent value="countdown">
                        <Card className="p-8 md:p-12 text-center bg-gradient-to-br from-primary/5 to-accent/5">
                            <div className="space-y-8">
                                {/* 時間設定 */}
                                {timeLeft === 0 && !isCountdownRunning && (
                                    <div className="flex justify-center gap-4">
                                        <div>
                                            <label className="text-sm text-muted-foreground block mb-2">分鐘</label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="99"
                                                value={minutes}
                                                onChange={(e) => setMinutes(Number(e.target.value))}
                                                className="w-24 text-center text-2xl"
                                            />
                                        </div>
                                        <div className="flex items-end pb-2 text-3xl font-bold">:</div>
                                        <div>
                                            <label className="text-sm text-muted-foreground block mb-2">秒鐘</label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="59"
                                                value={seconds}
                                                onChange={(e) => setSeconds(Number(e.target.value))}
                                                className="w-24 text-center text-2xl"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* 倒數顯示 */}
                                {(timeLeft > 0 || isCountdownRunning) && (
                                    <>
                                        <div className="relative">
                                            <div className="text-7xl md:text-9xl font-bold font-mono bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                                {displayMinutes.toString().padStart(2, "0")}:
                                                {displaySeconds.toString().padStart(2, "0")}
                                            </div>

                                            {/* 進度圓環 */}
                                            <div className="mt-8 flex justify-center">
                                                <div className="relative w-48 h-48">
                                                    <svg className="w-full h-full transform -rotate-90">
                                                        <circle
                                                            cx="96"
                                                            cy="96"
                                                            r="88"
                                                            className="stroke-muted"
                                                            strokeWidth="8"
                                                            fill="none"
                                                        />
                                                        <circle
                                                            cx="96"
                                                            cy="96"
                                                            r="88"
                                                            className="stroke-primary transition-all duration-1000"
                                                            strokeWidth="8"
                                                            fill="none"
                                                            strokeDasharray={`${2 * Math.PI * 88}`}
                                                            strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                                                            strokeLinecap="round"
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
                                                        {Math.round(progress)}%
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* 控制按鈕 */}
                                <div className="flex justify-center gap-4">
                                    {!isCountdownRunning ? (
                                        <Button onClick={handleCountdownStart} size="lg" className="w-32">
                                            <Play className="mr-2 h-5 w-5" />
                                            開始
                                        </Button>
                                    ) : (
                                        <Button onClick={handleCountdownPause} size="lg" variant="outline" className="w-32">
                                            <Pause className="mr-2 h-5 w-5" />
                                            暫停
                                        </Button>
                                    )}
                                    <Button onClick={handleCountdownReset} size="lg" variant="outline" className="w-32">
                                        <RotateCcw className="mr-2 h-5 w-5" />
                                        重置
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        {/* 快速設定 */}
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-6">
                            {[1, 3, 5, 10, 15, 30].map((min) => (
                                <Button
                                    key={min}
                                    variant="outline"
                                    onClick={() => {
                                        setMinutes(min);
                                        setSeconds(0);
                                        setTimeLeft(0);
                                        setIsCountdownRunning(false);
                                    }}
                                    disabled={isCountdownRunning || timeLeft > 0}
                                >
                                    {min} 分
                                </Button>
                            ))}
                        </div>
                    </TabsContent>

                    {/* 碼表 */}
                    <TabsContent value="stopwatch">
                        <Card className="p-8 md:p-12 text-center bg-gradient-to-br from-green-500/5 to-emerald-500/5">
                            <div className="space-y-8">
                                {/* 碼表顯示 */}
                                <div className="text-7xl md:text-9xl font-bold font-mono bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    {stopwatchMinutes.toString().padStart(2, "0")}:
                                    {stopwatchSeconds.toString().padStart(2, "0")}.
                                    <span className="text-5xl">{stopwatchMillis.toString().padStart(2, "0")}</span>
                                </div>

                                {/* 控制按鈕 */}
                                <div className="flex justify-center gap-4">
                                    {!isStopwatchRunning ? (
                                        <Button onClick={handleStopwatchStart} size="lg" className="w-32 bg-green-600 hover:bg-green-700">
                                            <Play className="mr-2 h-5 w-5" />
                                            開始
                                        </Button>
                                    ) : (
                                        <Button onClick={handleStopwatchPause} size="lg" variant="outline" className="w-32">
                                            <Pause className="mr-2 h-5 w-5" />
                                            暫停
                                        </Button>
                                    )}
                                    <Button onClick={handleStopwatchReset} size="lg" variant="outline" className="w-32">
                                        <RotateCcw className="mr-2 h-5 w-5" />
                                        重置
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* 使用說明 */}
                <Card className="p-6 bg-primary/5 border-primary/20">
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-foreground">
                        <span>💡</span>
                        使用說明
                    </h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• 切換「倒數計時」或「碼表」模式</li>
                        <li>• 倒數計時：設定時間後點擊開始，時間到會有提示音</li>
                        <li>• 碼表：從 0 開始計時，精確到百分之一秒</li>
                        <li>• 可隨時暫停或重置</li>
                    </ul>
                </Card>

                {/* 隱藏的音效元素 */}
                <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzKK0fPTgjMGHm7A7+OZUQ0LP6Db8ax" />
            </div>
        </ToolLayout>
    );
}
