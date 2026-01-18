import { useState, useEffect } from "react";
import { useSettings } from "@/hooks/SettingsContext";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, ArrowRight, Globe, Monitor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { updateVersionToLatest } from "@/lib/app-version";

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

interface FirstTimeSetupProps {
    onComplete: () => void;
}

export const FirstTimeSetup = ({ onComplete }: FirstTimeSetupProps) => {
    const [step, setStep] = useState<"loading" | "welcome" | "selecting">("loading");
    const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
    const { setThemeColor } = useSettings();
    const [progress, setProgress] = useState(0);
    const [currentHintIndex, setCurrentHintIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
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

        const fadeTimer = setTimeout(() => setIsFading(true), 3500);
        const timer = setTimeout(() => {
            setStep("welcome");
            setIsFading(false);
        }, 4000);

        return () => {
            clearInterval(progressTimer);
            clearTimeout(fadeTimer);
            clearTimeout(timer);
        };
    }, []);

    useEffect(() => {
        const hintTimer = setInterval(() => {
            setCurrentHintIndex((prev) => (prev + 1) % loadingHints.length);
        }, 600);
        return () => clearInterval(hintTimer);
    }, []);

    const handleConfirm = () => {
        if (selectedTheme) {
            setThemeColor(selectedTheme);
            localStorage.setItem(SETUP_STORAGE_KEY, "true");
            updateVersionToLatest();
            setTimeout(() => onComplete(), 100);
        }
    };

    const totalFiles = 839;
    const currentFile = Math.min(Math.floor((progress / 100) * totalFiles), totalFiles);
    const filePaths = [
        "src/components/CalendarView.tsx",
        "src/components/WeatherWidget.tsx",
        "src/hooks/SettingsContext.tsx",
        "src/lib/utils.ts",
        "public/data/announcements.json",
        "src/components/ui/button.tsx",
        "src/components/ResponsiveNav.tsx",
        "src/App.tsx",
        "src/index.css"
    ];

    if (step === "loading") {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-[#020617] p-8 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>

                <div className={`flex flex-col items-center justify-center gap-10 p-8 w-full max-w-xl transition-all duration-500 relative z-10 ${isFading ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
                    <p className="text-sm font-bold text-blue-400/60 tracking-widest uppercase animate-pulse">
                        CMJH V2
                    </p>

                    <div className="relative w-full flex flex-col items-center gap-12">
                        {/* Main Transmission Container: Stack vertically on mobile, horizontally on desktop */}
                        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-0 px-12 relative">
                            {/* Source: Cloud/Server */}
                            <div className="relative z-10 transition-transform hover:scale-105 duration-300">
                                <motion.div
                                    animate={{ boxShadow: ["0 0 0px rgba(59, 130, 246, 0)", "0 0 30px rgba(59, 130, 246, 0.3)", "0 0 0px rgba(59, 130, 246, 0)"] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="p-5 rounded-3xl bg-gray-800 shadow-2xl border border-blue-900 flex items-center justify-center group"
                                >
                                    <Globe className="w-10 h-10 text-blue-500 group-hover:rotate-12 transition-transform" />
                                </motion.div>
                                <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black font-mono text-blue-500/80 uppercase whitespace-nowrap tracking-widest">伺服器</p>
                            </div>

                            {/* Horizontal Transmission Path (Desktop) */}
                            <div className="hidden lg:flex absolute inset-0 items-center justify-center pointer-events-none px-32">
                                <div className="w-full h-1 bg-gray-800 rounded-full relative overflow-hidden">
                                    {[0, 1, 2].map((i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ left: "-10%" }}
                                            animate={{ left: "110%" }}
                                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5, ease: "linear" }}
                                            className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-80 flex items-center justify-center"
                                        >
                                            <ArrowRight className="w-4 h-4 text-blue-400 opacity-50" />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Vertical Transmission Path (Mobile) */}
                            <div className="lg:hidden absolute inset-0 flex items-center justify-center pointer-events-none py-12">
                                <div className="w-1 h-24 bg-gray-800 rounded-full relative overflow-hidden">
                                    {[0, 1, 2].map((i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ top: "-10%" }}
                                            animate={{ top: "110%" }}
                                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5, ease: "linear" }}
                                            className="absolute left-0 w-full h-8 bg-gradient-to-b from-transparent via-blue-500 to-transparent opacity-80 flex items-center justify-center"
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Destination: Local Client */}
                            <div className="relative z-10 transition-transform hover:scale-105 duration-300">
                                <motion.div
                                    animate={{ boxShadow: ["0 0 0px rgba(139, 92, 246, 0)", "0 0 30px rgba(139, 92, 246, 0.3)", "0 0 0px rgba(139, 92, 246, 0)"] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                                    className="p-5 rounded-3xl bg-gray-800 shadow-2xl border border-purple-900 flex items-center justify-center group"
                                >
                                    <Monitor className="w-10 h-10 text-purple-500 group-hover:-rotate-12 transition-transform" />
                                </motion.div>
                                <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black font-mono text-purple-500/80 uppercase whitespace-nowrap tracking-widest">本地端</p>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col items-center gap-6 w-full">
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={currentFile}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="text-[11px] font-mono font-bold text-blue-400 bg-blue-500/5 px-4 py-1.5 rounded-full border border-blue-500/10"
                                >
                                    SYNCING: {filePaths[currentFile % filePaths.length]}
                                </motion.p>
                            </AnimatePresence>

                            <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-black font-mono tracking-tighter bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                            {currentFile}
                                        </span>
                                        <span className="text-gray-600 font-mono text-sm">Files</span>
                                    </div>
                                    <div className="h-10 w-[2px] bg-gray-800 rotate-[20deg]" />
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black font-mono text-gray-700">
                                            {totalFiles}
                                        </span>
                                        <span className="text-gray-600 font-mono text-[10px]">Files</span>
                                    </div>
                                </div>
                                <div className="w-48 h-1 bg-gray-800 rounded-full mt-4 overflow-hidden relative">
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-6 flex items-center justify-center mt-4 text-xs text-white/30 font-mono italic">
                        {loadingHints[currentHintIndex]}
                    </div>
                </div>
            </div>
        );
    }

    const welcomeStep = (
        <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10"
        >
            <div className="flex-1 text-left space-y-8">
                <div>
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold border border-primary/30 mb-6 uppercase tracking-wider">
                        <Sparkles className="w-3 h-3" />
                        歡迎來到 崇明國中 V2
                    </span>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-6">
                        <div className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            CMJH-V2
                        </div>
                        <div className="text-white flex items-center gap-4">
                            全新升級
                            <div className="h-2 w-24 md:w-48 bg-gradient-to-r from-primary to-transparent rounded-full hidden md:block" />
                        </div>
                    </h1>
                    <p className="text-xl text-slate-400 font-medium max-w-lg leading-relaxed">
                        重新定義網站，結合現代美學與智能工具。
                        探索更直覺、更流暢的體驗。
                    </p>
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                    <Button
                        size="lg"
                        className="h-16 px-12 text-xl font-bold rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-[1.02] active:scale-95 transition-all gap-3 overflow-hidden relative group shadow-[0_0_40px_rgba(79,70,229,0.3)]"
                        onClick={() => setStep("selecting")}
                    >
                        立即體驗
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="h-16 px-10 text-xl font-bold rounded-2xl border-2 border-slate-700 bg-transparent hover:bg-slate-800 transition-all text-white"
                        onClick={() => window.open('https://github.com/NOC0212/cmjh-v2', '_blank')}
                    >
                        開發日誌及原碼
                    </Button>
                </div>
            </div>

            <div className="flex-1 relative flex justify-center lg:justify-end">
                <div className="relative w-80 h-80 md:w-[480px] md:h-[480px]">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 to-purple-600/30 blur-[100px] rounded-full"
                    />

                    <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="relative z-10 w-full h-full flex items-center justify-center p-8"
                    >
                        <div className="w-full h-full rounded-[4rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 shadow-2xl flex items-center justify-center relative overflow-hidden group border border-white/10">
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex gap-6">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1], y: [0, -5, 0] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-white shadow-[0_0_40px_rgba(255,255,255,0.4)]"
                                />
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1], y: [0, 5, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                                    className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-white shadow-[0_0_40px_rgba(255,255,255,0.4)]"
                                />
                            </div>
                            <div className="absolute bottom-16 right-16 w-32 md:w-48 h-10 bg-white/20 rounded-full blur-xl animate-pulse" />
                            <div className="absolute top-16 left-16 w-16 md:w-24 h-16 md:h-24 bg-white/10 rounded-full blur-md" />
                        </div>

                        <motion.div
                            animate={{ x: [-15, 15, -15], y: [-15, 15, -15], rotate: [0, 10, 0] }}
                            transition={{ duration: 8, repeat: Infinity }}
                            className="absolute -bottom-4 -left-4 w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-indigo-500/40 backdrop-blur-xl shadow-2xl border border-white/20 flex items-center justify-center"
                        >
                            <Monitor className="w-10 h-10 md:w-16 md:h-16 text-white/80" />
                        </motion.div>
                        <motion.div
                            animate={{ x: [15, -15, 15], y: [15, -15, 15], rotate: [0, -10, 0] }}
                            transition={{ duration: 7, repeat: Infinity, delay: 1 }}
                            className="absolute top-4 -right-4 w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-purple-500/40 backdrop-blur-xl shadow-2xl border border-white/20 flex items-center justify-center"
                        >
                            <Globe className="w-6 h-6 md:w-12 md:h-12 text-white/80" />
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="fixed inset-0 flex items-start md:items-center justify-center bg-[#020617] p-4 md:p-8 overflow-y-auto overflow-x-hidden">
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>

            <AnimatePresence mode="wait">
                {step === "welcome" ? welcomeStep : (
                    <motion.div
                        key="selecting"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-5xl mx-auto relative z-10 pt-12 md:pt-0 pb-12"
                    >
                        <div className="text-center mb-10 md:mb-16 space-y-4">
                            <h1 className="text-3xl md:text-6xl font-black text-white tracking-tighter leading-tight">
                                定義您的
                                <span className="block md:inline px-2 md:px-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">專屬風格</span>
                            </h1>
                            <p className="text-lg md:text-xl text-slate-400 font-medium">
                                選擇一個主題，讓 cmjh-v2 展現您的個性。
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                            {THEMES.map((theme) => (
                                <button
                                    key={theme.id}
                                    onClick={() => setSelectedTheme(theme.id)}
                                    className={`group relative p-8 rounded-[2.5rem] border-2 transition-all duration-500 hover:scale-[1.05] ${selectedTheme === theme.id
                                        ? "border-blue-500 bg-blue-500/10 shadow-[0_0_50px_rgba(59,130,246,0.2)]"
                                        : "border-slate-800 bg-slate-900/50 hover:border-slate-600"
                                        }`}
                                >
                                    {selectedTheme === theme.id && (
                                        <motion.div
                                            layoutId="checked"
                                            className="absolute -top-3 -right-3 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg z-10 border-4 border-[#020617]"
                                        >
                                            <Check className="w-6 h-6 text-white" />
                                        </motion.div>
                                    )}

                                    <div className="flex flex-col items-center gap-6">
                                        <div
                                            className="w-20 h-20 rounded-full shadow-2xl border-4 border-slate-800 transition-transform group-hover:rotate-12 group-hover:scale-110 duration-500"
                                            style={{ background: theme.color }}
                                        ></div>

                                        <h3 className={`text-xl font-bold transition-colors ${selectedTheme === theme.id ? "text-white" : "text-slate-400"}`}>
                                            {theme.name}
                                        </h3>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-center">
                            <Button
                                onClick={handleConfirm}
                                disabled={!selectedTheme}
                                size="lg"
                                className="h-16 px-16 text-xl font-bold rounded-2xl shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-30 disabled:grayscale"
                            >
                                {selectedTheme ? "完成並進入系統" : "請選擇一個主題"}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const checkFirstTimeSetup = (): boolean => localStorage.getItem(SETUP_STORAGE_KEY) === "true";
