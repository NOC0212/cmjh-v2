import { useState, useEffect, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, RotateCcw } from "lucide-react";

export default function Timer() {
    const [mode, setMode] = useState<"countdown" | "stopwatch">("countdown");

    const [minutes, setMinutes] = useState(5);
    const [seconds, setSeconds] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isCountdownRunning, setIsCountdownRunning] = useState(false);

    const [stopwatchTime, setStopwatchTime] = useState(0);
    const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!isCountdownRunning) return;

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

    useEffect(() => {
        if (isStopwatchRunning) {
            const timer = setInterval(() => {
                setStopwatchTime((prev) => prev + 10);
            }, 10);

            return () => clearInterval(timer);
        }
    }, [isStopwatchRunning]);

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

    const displayMinutes = Math.floor(timeLeft / 60);
    const displaySeconds = timeLeft % 60;
    const totalInit = minutes * 60 + seconds;
    const progress = timeLeft > 0 ? (timeLeft / totalInit) * 100 : 0;

    const stopwatchMinutes = Math.floor(stopwatchTime / 60000);
    const stopwatchSeconds = Math.floor((stopwatchTime % 60000) / 1000);
    const stopwatchMillis = Math.floor((stopwatchTime % 1000) / 10);

    const radius = 88;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - progress / 100);

    return (
        <ToolLayout title="計時器">
            <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto">
                <Tabs value={mode} onValueChange={(v) => setMode(v as "countdown" | "stopwatch")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
                        <TabsTrigger value="countdown">倒數計時</TabsTrigger>
                        <TabsTrigger value="stopwatch">碼表</TabsTrigger>
                    </TabsList>

                    <TabsContent value="countdown">
                        <Card className="p-6 sm:p-8 text-center">
                            <div className="space-y-6">
                                {timeLeft === 0 && !isCountdownRunning && (
                                    <div className="flex justify-center gap-4 sm:gap-6">
                                        <div>
                                            <label className="text-xs text-muted-foreground block mb-1.5">分鐘</label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="99"
                                                value={minutes}
                                                onChange={(e) => setMinutes(Number(e.target.value))}
                                                className="w-20 sm:w-24 text-center text-xl sm:text-2xl h-12"
                                            />
                                        </div>
                                        <div className="flex items-end pb-2 text-2xl sm:text-3xl font-bold text-muted-foreground">:</div>
                                        <div>
                                            <label className="text-xs text-muted-foreground block mb-1.5">秒鐘</label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="59"
                                                value={seconds}
                                                onChange={(e) => setSeconds(Number(e.target.value))}
                                                className="w-20 sm:w-24 text-center text-xl sm:text-2xl h-12"
                                            />
                                        </div>
                                    </div>
                                )}

                                {(timeLeft > 0 || isCountdownRunning) && (
                                    <div className="flex flex-col items-center">
                                        <div className="text-6xl sm:text-8xl font-bold font-mono bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-wider">
                                            {displayMinutes.toString().padStart(2, "0")}:
                                            {displaySeconds.toString().padStart(2, "0")}
                                        </div>

                                        <div className="mt-6 relative w-40 h-40 sm:w-48 sm:h-48">
                                            <svg className="w-full h-full -rotate-90">
                                                <circle
                                                    cx="50%"
                                                    cy="50%"
                                                    r={radius}
                                                    className="stroke-primary/15"
                                                    strokeWidth="8"
                                                    fill="none"
                                                />
                                                <circle
                                                    cx="50%"
                                                    cy="50%"
                                                    r={radius}
                                                    className="stroke-primary transition-all duration-1000 ease-linear"
                                                    strokeWidth="8"
                                                    fill="none"
                                                    strokeDasharray={circumference}
                                                    strokeDashoffset={offset}
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-lg sm:text-xl font-bold text-muted-foreground">
                                                    {Math.round(progress)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-center gap-3 sm:gap-4">
                                    {!isCountdownRunning ? (
                                        <Button onClick={handleCountdownStart} size="lg" className="w-28 sm:w-32 h-12">
                                            <Play className="mr-1.5 h-5 w-5" />
                                            開始
                                        </Button>
                                    ) : (
                                        <Button onClick={handleCountdownPause} size="lg" variant="outline" className="w-28 sm:w-32 h-12">
                                            <Pause className="mr-1.5 h-5 w-5" />
                                            暫停
                                        </Button>
                                    )}
                                    <Button onClick={handleCountdownReset} size="lg" variant="outline" className="w-28 sm:w-32 h-12">
                                        <RotateCcw className="mr-1.5 h-5 w-5" />
                                        重置
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 mt-4 sm:mt-6">
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
                                    className="h-10 text-sm"
                                >
                                    {min} 分
                                </Button>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="stopwatch">
                        <Card className="p-6 sm:p-8 text-center">
                            <div className="space-y-6">
                                <div className="font-mono tracking-wider">
                                    <span className="text-6xl sm:text-8xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                        {stopwatchMinutes.toString().padStart(2, "0")}:
                                        {stopwatchSeconds.toString().padStart(2, "0")}
                                    </span>
                                    <span className="text-3xl sm:text-5xl font-bold text-muted-foreground/60">
                                        .{stopwatchMillis.toString().padStart(2, "0")}
                                    </span>
                                </div>

                                <div className="flex justify-center gap-3 sm:gap-4">
                                    {!isStopwatchRunning ? (
                                        <Button onClick={handleStopwatchStart} size="lg" className="w-28 sm:w-32 h-12">
                                            <Play className="mr-1.5 h-5 w-5" />
                                            開始
                                        </Button>
                                    ) : (
                                        <Button onClick={handleStopwatchPause} size="lg" variant="outline" className="w-28 sm:w-32 h-12">
                                            <Pause className="mr-1.5 h-5 w-5" />
                                            暫停
                                        </Button>
                                    )}
                                    <Button onClick={handleStopwatchReset} size="lg" variant="outline" className="w-28 sm:w-32 h-12">
                                        <RotateCcw className="mr-1.5 h-5 w-5" />
                                        重置
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>

                <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzKK0fPTgjMGHm7A7+OZUQ0LP6Db8ax" />
            </div>
        </ToolLayout>
    );
}
