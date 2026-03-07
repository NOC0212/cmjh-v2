import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Star, Download, Megaphone, Utensils, Calendar, Globe, Github, MessageSquare } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { updateVersionToLatest } from "@/lib/app-version";


const SETUP_STORAGE_KEY = "cmjh-first-setup-completed";


interface FirstTimeSetupProps {
    onComplete: () => void;
}

const AnimatedNumber = ({ value }: { value: number }) => {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const controls = animate(count, value, { duration: 5, ease: "easeOut" });
        return controls.stop;
    }, [value, count]);

    useEffect(() => {
        return rounded.on("change", (latest) => setDisplayValue(latest));
    }, [rounded]);

    return <>{displayValue}</>;
};

export const FirstTimeSetup = ({ onComplete }: FirstTimeSetupProps) => {

    const handleConfirm = () => {
        localStorage.setItem(SETUP_STORAGE_KEY, "true");
        updateVersionToLatest();
        setTimeout(() => onComplete(), 100);
    };

    return (
        <main className="fixed inset-0 w-full h-full bg-white dark:bg-[#020617] transition-colors duration-500 overflow-y-auto">
            {/* 環境背景光圈 */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute -bottom-32 -left-32 w-[800px] h-[800px] rounded-full bg-teal-500/10 dark:bg-teal-500/15 blur-[130px]" />
                <div className="absolute -top-32 -right-32 w-[800px] h-[800px] rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-[130px]" />
            </div>

            {/* 內容置中容器 */}
            <div className="relative z-10 min-h-screen w-full flex flex-col items-center justify-center p-6 md:p-12">
                <AnimatePresence mode="wait">
                    <motion.div
                        key="welcome"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-7xl flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-32 text-center lg:text-left"
                    >
                        {/* 文字內容 */}
                        <div className="space-y-8 animate-slide-in-left max-w-2xl">
                            <div>
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-bold border border-teal-500/20 dark:border-teal-500/30 mb-6 uppercase tracking-wider transition-colors">
                                    <Sparkles className="w-3 h-3" />
                                    歡迎來到 崇明國中 V2
                                </span>
                                <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-6 flex flex-col">
                                    <span className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 dark:from-cyan-400 dark:via-teal-400 dark:to-emerald-400 bg-clip-text text-transparent inline-block pb-3 leading-tight">
                                        CMJH-V2
                                    </span>
                                    <div className="text-slate-900 dark:text-white flex items-center justify-center lg:justify-start gap-4 transition-colors">
                                        全新升級
                                        <div className="h-2 w-24 md:w-48 bg-gradient-to-r from-teal-500 to-transparent rounded-full hidden md:block" />
                                    </div>
                                </h1>
                                <p className="text-xl text-slate-600 dark:text-slate-400 font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed transition-colors">
                                    重新定義網站，結合現代美學與智能工具。
                                    探索更直覺、更流暢的體驗。 此為非官方網站，請注意
                                </p>
                            </div>

                            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                                <Button
                                    size="lg"
                                    className="h-16 px-12 text-xl font-bold rounded-2xl text-white bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 hover:scale-[1.02] active:scale-95 transition-all gap-3 overflow-hidden relative group shadow-[0_0_40px_rgba(16,185,129,0.3)]"
                                    onClick={handleConfirm}
                                >
                                    立即體驗
                                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="h-16 px-10 text-xl font-bold rounded-2xl border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-white bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-bold"
                                    onClick={() => window.open('https://github.com/NOC0212/cmjh-v2', '_blank')}
                                >
                                    開發日誌及原碼
                                </Button>
                            </div>
                        </div>

                        {/* 圖形側 - 手機圖片 */}
                        <div className="relative w-80 h-[500px] md:w-[500px] md:h-[650px] animate-slide-in-right flex-shrink-0 flex items-center justify-center">
                            {/* 手機後方的環境光圈 */}
                            <motion.div
                                animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 blur-[80px] rounded-full"
                            />

                            {/* 背後手機 (phone2.png) - 僅限桌面版 */}
                            <motion.img
                                src="/phone2.png"
                                alt="App Preview Back"
                                initial={{ x: 40, y: 40, opacity: 0, rotate: 0 }}
                                animate={{ x: 110, y: -40, opacity: 0.9, rotate: 15 }}
                                transition={{ delay: 0.4, duration: 1 }}
                                className="absolute z-10 w-[90%] h-[90%] object-contain drop-shadow-2xl brightness-95 dark:brightness-80 hidden lg:block"
                            />

                            {/* 前方手機 (phone.png) */}
                            <motion.img
                                src="/phone.png"
                                alt="App Preview Front"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.8 }}
                                className="relative z-20 w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_20px_50px_rgba(16,185,129,0.3)]"
                            />
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
            {/* 功能亮點 Bento Grid */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-32 min-h-screen flex flex-col justify-center space-y-16">
                <div className="text-center lg:text-left space-y-4">
                    <span className="text-teal-600 dark:text-teal-400 font-bold tracking-widest uppercase text-sm flex items-center gap-3">
                        <div className="w-8 h-[2px] bg-teal-500" /> 功能亮點
                    </span>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight text-slate-900 dark:text-white transition-colors">
                        為你打造的<br />
                        <span className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 dark:from-cyan-400 dark:via-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">校園體驗</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* 主要主視覺卡片 (最新公告) */}
                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="md:col-span-8 md:row-span-2 p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.3)] flex flex-col justify-between group transition-all duration-500"
                    >
                        <div className="space-y-4">
                            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 dark:bg-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
                                <Megaphone className="w-7 h-7" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">最新公告</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed max-w-md font-medium">即時同步崇明國中官方網站資訊。自動抓取、精準推播，讓您不再錯過任何重要的校園消息與緊急通知。</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-8">
                            <div className="flex -space-x-4">
                                {[1,2,3].map(i => (
                                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-900 bg-gradient-to-br from-teal-400 to-emerald-500 opacity-50" />
                                ))}
                            </div>
                            <span className="text-base font-bold text-slate-400">50+ 用戶信賴</span>
                        </div>
                    </motion.div>

                    {/* 統計卡片 (訪問次數) */}
                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="md:col-span-4 p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.3)] flex flex-col gap-4 transition-all duration-500"
                    >
                        <Download className="w-7 h-7 text-slate-400" />
                        <div className="space-y-2">
                            <p className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white flex items-baseline">
                                <AnimatedNumber value={1000} /><span className="text-3xl text-slate-300 ml-1">+</span>
                            </p>
                            <p className="text-base font-bold text-slate-400">累積訪問次數</p>
                        </div>
                    </motion.div>

                    {/* 評分卡片 */}
                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="md:col-span-4 p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.3)] flex flex-col justify-between transition-all duration-500"
                    >
                        <div className="flex gap-1.5">
                            {[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'}`} />)}
                        </div>
                        <h4 className="text-lg font-bold text-slate-400 mt-2">總體評價</h4>
                        <div className="space-y-4 mt-2">
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="text-slate-400 font-medium">介面美觀度</span>
                                <span className="text-xl font-black text-slate-900 dark:text-white">4.8<span className="text-slate-300 font-bold ml-1">/5</span></span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="text-slate-400 font-medium">功能實用度</span>
                                <span className="text-xl font-black text-slate-900 dark:text-white">4.5<span className="text-slate-300 font-bold ml-1">/5</span></span>
                            </div>
                        </div>
                    </motion.div>

                    {/* 下方卡片 1 (午餐) */}
                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="md:col-span-5 p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.3)] space-y-4 transition-all duration-500"
                    >
                        <Utensils className="w-7 h-7 text-emerald-500" />
                        <div className="space-y-2">
                            <h4 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">午餐菜單</h4>
                            <p className="text-sm font-bold text-slate-500 leading-relaxed">當日菜色與熱量分析，美味第一手掌握</p>
                        </div>
                    </motion.div>

                    {/* 下方卡片 2 (行事曆) */}
                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="md:col-span-3 p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.3)] space-y-4 transition-all duration-500"
                    >
                        <Calendar className="w-7 h-7 text-blue-500" />
                        <div className="space-y-2">
                            <h4 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">校園行事曆</h4>
                            <p className="text-sm font-bold text-slate-500 leading-relaxed">重要時程、考程全面掌握</p>
                        </div>
                    </motion.div>

                    {/* 下方卡片 3 (連結) */}
                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="md:col-span-4 p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.3)] space-y-4 transition-all duration-500"
                    >
                        <Globe className="w-7 h-7 text-cyan-500" />
                        <div className="space-y-2">
                            <h4 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">常用網址</h4>
                            <p className="text-sm font-bold text-slate-500 leading-relaxed">收錄最常用的各類校園系統</p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* 開源區塊 */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-32 min-h-screen flex flex-col justify-center">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="p-12 md:p-16 rounded-[3rem] bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-[0_40px_100px_rgba(0,0,0,0.03)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.4)] relative overflow-hidden"
                >
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-10">
                            <div className="space-y-6">
                                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-sm font-bold border border-cyan-500/20">
                                    <Github className="w-4 h-4" /> Open Source
                                </span>
                                <div className="space-y-2">
                                    <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white leading-tight">
                                        完全開源<br />
                                        <span className="text-teal-500">社群驅動</span>
                                    </h2>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed max-w-md">
                                    CMJH-V2 以開源為核心理念，程式碼公開可審視、可貢獻。每一次改進，都來自社群的力量。
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <Button className="h-14 px-8 rounded-2xl bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold gap-3 text-lg shadow-xl shadow-slate-200 dark:shadow-none transition-all hover:scale-105 active:scale-95" onClick={() => window.open('https://github.com/NOC0212/cmjh-v2', '_blank')}>
                                    <Github className="w-6 h-6" /> 檢視原始碼
                                </Button>
                                <Button variant="outline" className="h-14 px-8 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent font-bold gap-3 text-lg transition-all hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-105 active:scale-95 shadow-sm text-slate-900 dark:text-white" onClick={() => window.open('https://github.com/NOC0212/cmjh-v2/issues', '_blank')}>
                                    <MessageSquare className="w-6 h-6" /> 提出建議
                                </Button>
                            </div>

                            <div className="grid grid-cols-3 gap-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <div>
                                    <p className="text-3xl font-black text-slate-900 dark:text-white mb-1 tracking-tighter">100+</p>
                                    <p className="text-sm font-bold text-slate-400 tracking-wider uppercase">GitHub 提交數</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-black text-slate-900 dark:text-white mb-1 tracking-tighter">20+</p>
                                    <p className="text-sm font-bold text-slate-400 tracking-wider uppercase">版本數</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-black text-slate-900 dark:text-white mb-1 tracking-tighter text-teal-500">MIT</p>
                                    <p className="text-sm font-bold text-slate-400 tracking-wider uppercase">License</p>
                                </div>
                            </div>
                        </div>

                        {/* 控制台 UI */}
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-500/20 to-teal-500/20 blur-3xl rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="relative bg-[#1e2233] rounded-[2rem] border border-slate-700/50 shadow-2xl overflow-hidden font-mono text-sm leading-relaxed shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
                                <div className="border-b border-white/5 bg-white/5 px-6 py-4 flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <div className="w-3.5 h-3.5 rounded-full bg-red-500/80" />
                                        <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80" />
                                        <div className="w-3.5 h-3.5 rounded-full bg-green-500/80" />
                                    </div>
                                    <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Console</span>
                                </div>
                                <div className="p-8 space-y-6 text-slate-300">
                                    <div className="space-y-2">
                                        <p className="text-slate-500">// 複製儲存庫</p>
                                        <p><span className="text-purple-400">git</span> clone <span className="text-cyan-400">https://github.com/NOC0212/cmjh-v2.git</span></p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-slate-500">// 安裝依賴</p>
                                        <p><span className="text-purple-400">npm</span> install</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-slate-500">// 啟動開發環境</p>
                                        <p><span className="text-purple-400">npm</span> run dev</p>
                                    </div>
                                    <div className="pt-4 flex items-center gap-3 text-emerald-400 font-bold">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        準備好開始貢獻！
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </main>
    );
};

export const checkFirstTimeSetup = (): boolean => localStorage.getItem(SETUP_STORAGE_KEY) === "true";
