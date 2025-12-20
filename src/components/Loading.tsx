import { useState, useEffect } from "react";

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

const loadingHints = [
  "正在載入 CalendarView.tsx...",
  "正在載入 WeatherWidget.tsx...",
  "正在載入 CountdownTimer.tsx...",
  "正在載入 ToolLayout.tsx...",
  "正在初始化應用程式..."
];

export function Loading({ fullScreen = false }: LoadingProps) {
  const [progress, setProgress] = useState(0);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);

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

    return () => clearInterval(progressTimer);
  }, []);

  useEffect(() => {
    // Rotate loading hints every 600ms
    const hintTimer = setInterval(() => {
      setCurrentHintIndex((prev) => (prev + 1) % loadingHints.length);
    }, 600);

    return () => clearInterval(hintTimer);
  }, []);

  const content = (
    <div className="flex flex-col items-center justify-center gap-6 p-8 w-full max-w-md">
      {/* Author Credit */}
      <p className="text-sm font-medium text-white/90 tracking-wide">
        本網站由 cy.noc0531 製作
      </p>

      {/* Progress Bar Container */}
      <div className="w-full">
        <div className="relative w-full h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
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
        <p className="text-center text-xs text-white/70 mt-2 font-mono">
          {Math.round(progress)}%
        </p>
      </div>

      {/* Loading Hint Carousel */}
      <div className="h-6 flex items-center justify-center">
        <p className="text-sm text-white/60 font-mono animate-pulse">
          {loadingHints[currentHintIndex]}
        </p>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)"
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center p-8 rounded-lg"
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)"
      }}
    >
      {content}
    </div>
  );
}
