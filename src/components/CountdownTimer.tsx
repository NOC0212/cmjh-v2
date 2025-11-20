import { useEffect, useState } from "react";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface CountdownConfig {
  targetDate: Date;
  startDate?: Date;
  label: string;
  progressLabel: string;
}

// 輔助函數：直接輸入台灣時間，自動轉換為正確的 Date 對象
// 使用方式：taiwanTime(年, 月, 日, 時, 分, 秒)
// 例如：taiwanTime(2025, 11, 13, 0, 0, 0) 代表 2025年11月13日 00:00 台灣時間
const taiwanTime = (year: number, month: number, day: number, hour = 0, minute = 0, second = 0): Date => {
  // 台灣時區是 UTC+8，所以要減去 8 小時來得到 UTC 時間
  return new Date(Date.UTC(year, month - 1, day, hour - 8, minute, second));
};

// 倒數計時配置列表 - 可以直接在這裡修改
// 現在可以直接輸入台灣時間，不用再計算時區了！
const countdownConfigs: CountdownConfig[] = [
  {
    targetDate: taiwanTime(2025, 11, 27, 0, 0, 0), // 2025年11月13日 00:00
    startDate: taiwanTime(2025, 10, 16, 0, 0, 0),   // 2025年10月3日 00:00
    label: "第二次段考倒數 11/27 11/28",
    progressLabel: "上次至本次段考進度條"
  },
  {
    targetDate: taiwanTime(2026, 1, 1, 0, 0, 0),   // 2026年1月1日 00:00
    startDate: taiwanTime(2025, 1, 1, 0, 0, 0),    // 2025年1月1日 00:00
    label: "2026年倒數",
    progressLabel: "2025年進度條"
  }
];

interface CountdownTimerProps {}

export function CountdownTimer({}: CountdownTimerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [progress, setProgress] = useState(0);

  const currentConfig = countdownConfigs[currentIndex];
  const { targetDate, startDate, label, progressLabel } = currentConfig;

  useEffect(() => {
    const getTaiwanTime = () => {
      const now = new Date();
      return new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (8 * 60 * 60 * 1000));
    };

    const calculateTimeLeft = () => {
      const taiwanNow = getTaiwanTime();
      const difference = targetDate.getTime() - taiwanNow.getTime();

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return null;
    };

    const calculateProgress = () => {
      const taiwanNow = getTaiwanTime();
      const target = targetDate.getTime();
      const start = startDate ? startDate.getTime() : taiwanNow.getTime() - (7 * 24 * 60 * 60 * 1000);
      const total = target - start;
      const elapsed = taiwanNow.getTime() - start;
      const percentage = Math.min(100, Math.max(0, (elapsed / total) * 100));
      return percentage;
    };

    setTimeLeft(calculateTimeLeft());
    setProgress(calculateProgress());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
      setProgress(calculateProgress());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, startDate]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + countdownConfigs.length) % countdownConfigs.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % countdownConfigs.length);
  };

  const isComplete = progress >= 100;

  if (!timeLeft && !isComplete) {
    return null;
  }

  return (
    <div className="relative rounded-2xl p-8 border border-primary/20 overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-glow)] transition-all duration-500"
         style={{ background: 'var(--gradient-timer)' }}>
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-pulse opacity-50"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {label}
            </h2>
          </div>
          <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm rounded-full px-3 py-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              className="h-7 w-7 hover:bg-primary/20 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-semibold text-primary px-2">
              {currentIndex + 1} / {countdownConfigs.length}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="h-7 w-7 hover:bg-primary/20 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {!isComplete ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm rounded-xl p-5 text-center border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                  {timeLeft?.days || 0}
                </div>
                <div className="text-sm font-medium text-muted-foreground">天</div>
              </div>
              <div className="bg-gradient-to-br from-accent/10 to-accent/5 backdrop-blur-sm rounded-xl p-5 text-center border border-accent/20 hover:border-accent/40 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent mb-2">
                  {timeLeft?.hours || 0}
                </div>
                <div className="text-sm font-medium text-muted-foreground">時</div>
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm rounded-xl p-5 text-center border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                  {timeLeft?.minutes || 0}
                </div>
                <div className="text-sm font-medium text-muted-foreground">分</div>
              </div>
              <div className="bg-gradient-to-br from-accent/10 to-accent/5 backdrop-blur-sm rounded-xl p-5 text-center border border-accent/20 hover:border-accent/40 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent mb-2">
                  {timeLeft?.seconds || 0}
                </div>
                <div className="text-sm font-medium text-muted-foreground">秒</div>
              </div>
            </div>
            <div className="space-y-3 bg-background/30 backdrop-blur-sm rounded-xl p-4 border border-border/50">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-foreground">{progressLabel}</span>
                <span className="text-sm font-bold text-primary px-3 py-1 bg-primary/10 rounded-full">{progress.toFixed(1)}%</span>
              </div>
              <Progress value={progress} className="h-3" gradient />
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">時間到！</p>
          </div>
        )}
      </div>
    </div>
  );
}
