import { useState, useEffect } from "react";
import { useComponentSettings } from "@/hooks/useComponentSettings";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const SETUP_STORAGE_KEY = "cmjh-first-setup-completed";

interface Theme {
    id: string;
    name: string;
    primaryColor: string;
    accentColor: string;
    description: string;
}

const THEMES: Theme[] = [
    {
        id: "light",
        name: "淺色",
        primaryColor: "hsl(210 75% 48%)",
        accentColor: "hsl(45 93% 58%)",
        description: "明亮清新的淺色主題",
    },
    {
        id: "dark",
        name: "深色",
        primaryColor: "hsl(210 75% 55%)",
        accentColor: "hsl(0 0% 15%)",
        description: "護眼舒適的深色主題",
    },
    {
        id: "blue",
        name: "藍色",
        primaryColor: "hsl(210 75% 48%)",
        accentColor: "hsl(210 75% 55%)",
        description: "經典沉穩的藍色主題",
    },
    {
        id: "green",
        name: "綠色",
        primaryColor: "hsl(142 71% 45%)",
        accentColor: "hsl(142 71% 50%)",
        description: "清新自然的綠色主題",
    },
    {
        id: "orange",
        name: "橙色",
        primaryColor: "hsl(30 95% 55%)",
        accentColor: "hsl(30 95% 60%)",
        description: "活力充沛的橙色主題",
    },
    {
        id: "red",
        name: "紅色",
        primaryColor: "hsl(0 84% 60%)",
        accentColor: "hsl(0 84% 65%)",
        description: "熱情洋溢的紅色主題",
    },
    {
        id: "purple",
        name: "紫色",
        primaryColor: "hsl(271 81% 56%)",
        accentColor: "hsl(271 81% 61%)",
        description: "優雅神秘的紫色主題",
    },
    {
        id: "gradient",
        name: "漸變",
        primaryColor: "hsl(240 75% 52%)",
        accentColor: "hsl(271 81% 56%)",
        description: "多彩絢麗的漸變主題",
    },
];

interface FirstTimeSetupProps {
    onComplete: () => void;
}

export const FirstTimeSetup = ({ onComplete }: FirstTimeSetupProps) => {
    const [step, setStep] = useState<"loading" | "selecting">("loading");
    const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
    const { setTheme } = useComponentSettings();

    useEffect(() => {
        // 顯示載入動畫1.5秒
        const timer = setTimeout(() => {
            setStep("selecting");
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const handleConfirm = () => {
        if (selectedTheme) {
            // 儲存主題設定
            setTheme(selectedTheme);

            // 標記首次設定已完成
            localStorage.setItem(SETUP_STORAGE_KEY, "true");

            // 延遲一點讓主題先套用
            setTimeout(() => {
                onComplete();
            }, 100);
        }
    };

    if (step === "loading") {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
                <div className="text-center">
                    <div className="inline-block">
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                    <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 font-medium">
                        載入中...
                    </p>
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
                                <div className="flex gap-2">
                                    <div
                                        className="w-8 h-8 rounded-full shadow-md"
                                        style={{ background: theme.primaryColor }}
                                    ></div>
                                    <div
                                        className="w-8 h-8 rounded-full shadow-md"
                                        style={{ background: theme.accentColor }}
                                    ></div>
                                </div>

                                <div className="text-center">
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                        {theme.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {theme.description}
                                    </p>
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
