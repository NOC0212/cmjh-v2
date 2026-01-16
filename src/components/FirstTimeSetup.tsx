import { useState, useEffect } from "react";
import { useSettings } from "@/hooks/SettingsContext";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const loadingHints = [
    "正在載入 CalendarView.tsx...",
    "正在載入 WeatherWidget.tsx...",
    "正在載入 CountdownTimer.tsx...",
    "正在載入 ToolLayout.tsx...",
    "正在初始化應用程式...",
    "正在載入首次使用者介面...",
    "即將完成..."
];

const SETUP_STORAGE_KEY = "cmjh-first-setup-completed";


const THEMES = [
    { id: "blue", name: "活力藍", color: "#3b82f6" },
    { id: "red", name: "熱情紅", color: "#ef4444" },
    { id: "green", name: "清新綠", color: "#10b981" },
    { id: "orange", name: "亮麗橙", color: "#f59e0b" },
    { id: "purple", name: "神秘紫", color: "#8b5cf6" },
    { id: "neon", name: "極光霓虹", color: "#00f3ff" },
    { id: "modern", name: "現代漸層", color: "linear-gradient(135deg, #fbbf24, #f97316)" },
    { id: "gradient", name: "主題漸層", color: "linear-gradient(135deg, #3b82f6, #8b5cf6, #ef4444)" },
];

import { updateVersionToLatest } from "@/lib/app-version";

interface FirstTimeSetupProps {
    onComplete: () => void;
}

export const FirstTimeSetup = ({ onComplete }: FirstTimeSetupProps) => {

    const [step, setStep] = useState<"loading" | "selecting">("loading");
    const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
    const { setThemeColor } = useSettings();

    const [progress, setProgress] = useState(0);
    const [currentHintIndex, setCurrentHintIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        // Progress animation: 0 to 100 in 3 seconds
        const duration = 3000;
        const interval = 30;
        const increment = 100 / (duration / interval);

        const progressTimer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(progressTimer);
                    return 100;
                }
                return Math.min(prev + increment, 100);
            });
        }, interval);

        // After 3 seconds (100%), wait 500ms then start fade
        const fadeTimer = setTimeout(() => {
            setIsFading(true);
        }, 3500);

        // After fade animation (500ms), switch to selecting
        const timer = setTimeout(() => {
            setStep("selecting");
        }, 4000);

        return () => {
            clearInterval(progressTimer);
            clearTimeout(fadeTimer);
            clearTimeout(timer);
        };
    }, []);

    useEffect(() => {
        // Rotate loading hints every 600ms
        const hintTimer = setInterval(() => {
            setCurrentHintIndex((prev) => (prev + 1) % loadingHints.length);
        }, 600);

        return () => clearInterval(hintTimer);
    }, []);

    const handleConfirm = () => {
        if (selectedTheme) {
            // 儲存主題顏色
            setThemeColor(selectedTheme);

            // 標記首次設定已完成
            localStorage.setItem(SETUP_STORAGE_KEY, "true");

            // 寫入最新版本號
            updateVersionToLatest();

            // 延遲一點讓主題先套用
            setTimeout(() => {
                onComplete();
            }, 100);
        }
    };

    if (step === "loading") {
        return (
            <div
                className={`fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}
            >
                <div className={`flex flex-col items-center justify-center gap-6 p-8 w-full max-w-md transition-all duration-500 ${isFading ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
                    {/* Author Credit */}
                    <p className="text-sm font-medium text-gray-700 dark:text-white/90 tracking-wide">
                        本網站由 cy.noc0531 製作
                    </p>

                    {/* Progress Bar Container */}
                    <div className="w-full">
                        <div className="relative w-full h-3 bg-gray-200 dark:bg-white/20 rounded-full overflow-hidden backdrop-blur-sm shadow-inner">
                            {/* Progress Fill with Gradient */}
                            <div
                                className="absolute top-0 left-0 h-full rounded-full transition-all duration-100 ease-out"
                                style={{
                                    width: `${progress}%`,
                                    background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #a855f7 100%)",
                                    boxShadow: "0 0 20px rgba(139, 92, 246, 0.5)"
                                }}
                            />
                            {/* Shine Effect */}
                            <div
                                className="absolute top-0 left-0 h-full rounded-full opacity-30"
                                style={{
                                    width: `${progress}%`,
                                    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)"
                                }}
                            />
                        </div>
                        {/* Progress Percentage */}
                        <p className="text-center text-xs text-gray-500 dark:text-white/70 mt-2 font-mono">
                            {Math.round(progress)}%
                        </p>
                    </div>

                    {/* Loading Hint Carousel */}
                    <div className="h-6 flex items-center justify-center">
                        <p className="text-sm text-gray-400 dark:text-white/60 font-mono animate-pulse">
                            {loadingHints[currentHintIndex]}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 p-4 overflow-y-auto">
            <div className="w-full max-w-4xl mx-auto my-8">
                <div className="text-center mb-8 animate-fade-in">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                        歡迎使用崇明國中-v2
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        請選擇一個主題並開始
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {THEMES.map((theme) => (
                        <button
                            key={theme.id}
                            onClick={() => setSelectedTheme(theme.id)}
                            className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl ${selectedTheme === theme.id
                                ? "border-blue-500 bg-white dark:bg-gray-800 shadow-xl scale-105"
                                : "border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 hover:border-gray-300 dark:hover:border-gray-600"
                                }`}
                        >
                            {selectedTheme === theme.id && (
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                    <Check className="w-5 h-5 text-white" />
                                </div>
                            )}

                            <div className="flex flex-col items-center gap-3">
                                <div
                                    className="w-16 h-16 rounded-full shadow-lg border-4 border-white dark:border-gray-700 transition-transform group-hover:rotate-12"
                                    style={{ background: theme.color }}
                                ></div>

                                <div className="text-center">
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                        {theme.name}
                                    </h3>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="text-center">
                    <Button
                        onClick={handleConfirm}
                        disabled={!selectedTheme}
                        size="lg"
                        className="px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {selectedTheme ? "開始使用" : "請選擇主題"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export const checkFirstTimeSetup = (): boolean => {
    return localStorage.getItem(SETUP_STORAGE_KEY) === "true";
};
