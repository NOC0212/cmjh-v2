import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Hammer, AlertCircle } from "lucide-react";

interface MaintenancePageProps {
    maintenanceEndTime?: string;
    showTimer?: boolean;
    message?: string;
}

const MaintenancePage = ({
    maintenanceEndTime = "2026-01-05T00:00:00+08:00",
    showTimer = true,
    message = "網頁可能正在修復或更新，請稍後再試。"
}: MaintenancePageProps) => {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        isFinished: boolean;
    }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isFinished: false });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(maintenanceEndTime) - +new Date();

            if (difference <= 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0, isFinished: true };
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
                isFinished: false
            };
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        // Initial calculation
        setTimeLeft(calculateTimeLeft());

        return () => clearInterval(timer);
    }, [maintenanceEndTime]);

    return (
        <div className="min-h-screen w-full bg-[#030303] flex items-center justify-center p-4 font-sans text-white overflow-hidden relative">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-2xl w-full text-center z-10"
            >
                <div className="mb-8 flex justify-center">
                    <motion.div
                        animate={{
                            rotate: [0, -10, 10, -10, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center border border-white/10 backdrop-blur-xl shadow-2xl relative"
                    >
                        <Hammer className="w-12 h-12 text-blue-400" />
                        <div className="absolute -top-1 -right-1">
                            <motion.div
                                animate={{ opacity: [1, 0.5, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <AlertCircle className="w-6 h-6 text-yellow-500/80 fill-yellow-500/10" />
                            </motion.div>
                        </div>
                    </motion.div>
                </div>

                <h1 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white via-white/80 to-white/60 bg-clip-text text-transparent tracking-tight">
                    網頁維護中
                </h1>

                <p className="text-lg md:text-xl text-white/60 mb-12 max-w-lg mx-auto leading-relaxed">
                    {message}
                </p>

                {showTimer && (
                    <div className="space-y-8">
                        <div className="flex items-center justify-center gap-2 text-blue-400 font-medium tracking-wider uppercase text-sm mb-4">
                            <Clock className="w-4 h-4" />
                            <span>預計剩餘時間</span>
                        </div>

                        <div className="grid grid-cols-4 gap-3 md:gap-6">
                            {[
                                { label: "天", value: timeLeft.days },
                                { label: "時", value: timeLeft.hours },
                                { label: "分", value: timeLeft.minutes },
                                { label: "秒", value: timeLeft.seconds }
                            ].map((item) => (
                                <div key={item.label} className="relative group">
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 backdrop-blur-md transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/20">
                                        <span className="text-3xl md:text-5xl font-mono font-bold block mb-1">
                                            {item.value.toString().padStart(2, '0')}
                                        </span>
                                        <span className="text-[10px] md:text-xs text-white/40 uppercase tracking-widest font-semibold">
                                            {item.label}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            {timeLeft.isFinished && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="mt-8 py-3 px-6 bg-blue-500/20 border border-blue-500/30 rounded-full inline-block backdrop-blur-sm"
                                >
                                    <span className="text-blue-300 font-bold tracking-wide">
                                        ✨ 維修即將完成
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                <div className="mt-16 pt-8 border-t border-white/5">
                    <p className="text-white/20 text-sm">
                        © {new Date().getFullYear()} 崇明國中. All rights reserved.
                    </p>
                </div>
            </motion.div>

            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }}
            />
        </div>
    );
};

export default MaintenancePage;
