import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Hammer, AlertCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface MaintenanceModalProps {
    isOpen: boolean;
    maintenanceEndTime?: string;
    showTimer?: boolean;
    title?: string;
    message?: string;
}

const MaintenanceModal = ({
    isOpen,
    maintenanceEndTime,
    showTimer,
    title,
    message
}: MaintenanceModalProps) => {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        isFinished: boolean;
    }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isFinished: false });

    useEffect(() => {
        if (!isOpen) return;

        const calculateTimeLeft = () => {
            if (!maintenanceEndTime) return { days: 0, hours: 0, minutes: 0, seconds: 0, isFinished: true };
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

        setTimeLeft(calculateTimeLeft());

        return () => clearInterval(timer);
    }, [maintenanceEndTime, isOpen]);

    return (
        <Dialog open={isOpen}>
            <DialogContent 
                className="sm:max-w-xl border border-border bg-background/95 backdrop-blur-xl text-foreground shadow-2xl overflow-hidden p-0 [&>button]:hidden" 
                onPointerDownOutside={(e) => e.preventDefault()} 
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <div className="relative p-8 md:p-10 flex flex-col items-center text-center">
                    {/* 背景裝飾 - 使用主題色點綴 */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-50 pointer-events-none"></div>
                    
                    <motion.div
                        animate={{
                            rotate: [0, -5, 5, -5, 0],
                            scale: [1, 1.05, 1]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 backdrop-blur-md mb-6 relative z-10"
                    >
                        <Hammer className="w-10 h-10 text-primary" />
                        <div className="absolute -top-1 -right-1">
                            <motion.div
                                animate={{ opacity: [1, 0.5, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <AlertCircle className="w-5 h-5 text-yellow-500 fill-yellow-500/10" />
                            </motion.div>
                        </div>
                    </motion.div>

                    <DialogHeader className="relative z-10 flex flex-col items-center w-full">
                        <DialogTitle className="text-3xl md:text-4xl font-black mb-2 text-primary tracking-tight italic text-center w-full">
                            {title}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-sm mx-auto text-center">
                            {message}
                        </DialogDescription>
                    </DialogHeader>

                    {showTimer && (
                        <div className="mt-8 w-full relative z-10">
                            <div className="flex items-center justify-center gap-2 text-muted-foreground font-medium tracking-wider uppercase text-xs mb-4">
                                <Clock className="w-3.5 h-3.5 text-primary/70" />
                                <span>預計剩餘時間</span>
                            </div>

                            <div className="grid grid-cols-4 gap-3">
                                {[
                                    { label: "天", value: timeLeft.days },
                                    { label: "時", value: timeLeft.hours },
                                    { label: "分", value: timeLeft.minutes },
                                    { label: "秒", value: timeLeft.seconds }
                                ].map((item) => (
                                    <div key={item.label} className="bg-muted/50 border border-border rounded-xl p-3 backdrop-blur-md">
                                        <span className="text-xl md:text-2xl font-mono font-bold block text-foreground">
                                            {item.value.toString().padStart(2, '0')}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {timeLeft.isFinished && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="mt-6 py-2 px-4 bg-primary/10 border border-primary/20 rounded-full inline-block backdrop-blur-sm"
                                    >
                                        <span className="text-primary text-sm font-bold tracking-wide">
                                            ✨ 維修即將完成
                                        </span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default MaintenanceModal;
