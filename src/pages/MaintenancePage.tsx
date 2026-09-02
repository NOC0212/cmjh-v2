import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock } from "lucide-react";
import ConstructionAnimation from "@/components/ConstructionAnimation";

interface MaintenancePageProps {
  maintenanceEndTime?: string;
  showTimer?: boolean;
  title?: string;
  message?: string;
}

/** 全螢幕維護模式頁面 */
export default function MaintenancePage({
  maintenanceEndTime,
  showTimer,
  title = "系統維護中",
  message = "網站正在進行系統維護，請稍後再訪問。",
}: MaintenancePageProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isFinished: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isFinished: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!maintenanceEndTime)
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isFinished: true };
      const difference = +new Date(maintenanceEndTime) - +new Date();

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isFinished: true };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isFinished: false,
      };
    };

    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    setTimeLeft(calculateTimeLeft());
    return () => clearInterval(timer);
  }, [maintenanceEndTime]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="relative max-w-lg w-full">
        {/* 背景裝飾 */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-50 pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-primary/5 blur-[80px] pointer-events-none" />

        <div className="relative flex flex-col items-center text-center px-4 py-12">
          {/* 道路施工動畫 */}
          <div className="mb-6 w-full">
            <ConstructionAnimation />
          </div>

          <h1 className="text-3xl md:text-4xl font-black mb-2 text-primary tracking-tight italic">
            {title}
          </h1>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-sm mx-auto">
            {message}
          </p>

          {showTimer && (
            <div className="mt-8 w-full">
              <div className="flex items-center justify-center gap-2 text-muted-foreground font-medium tracking-wider uppercase text-xs mb-4">
                <Clock className="w-3.5 h-3.5 text-primary/70" />
                <span>預計剩餘時間</span>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "天", value: timeLeft.days },
                  { label: "時", value: timeLeft.hours },
                  { label: "分", value: timeLeft.minutes },
                  { label: "秒", value: timeLeft.seconds },
                ].map((item) => (
                  <div key={item.label} className="bg-muted/50 border border-border rounded-xl p-3">
                    <span className="text-xl md:text-2xl font-mono font-bold block text-foreground">
                      {item.value.toString().padStart(2, "0")}
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
                    className="mt-6 py-2 px-4 bg-primary/10 border border-primary/20 rounded-full inline-block"
                  >
                    <span className="text-primary text-sm font-bold tracking-wide">✨ 維修即將完成</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}