import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  gradient?: boolean;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, gradient = false, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("relative h-4 w-full overflow-hidden rounded-full bg-muted", className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full w-full flex-1 transition-all relative",
        gradient ? "bg-gradient-to-r from-[hsl(210,75%,55%)] to-[hsl(271,81%,56%)]" : "bg-primary"
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    >
      {gradient && value && value > 0 && (
        <>
          {/* 進度條末端顏色光暈效果 */}
          <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white/30 via-purple-300/20 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white/50 to-transparent animate-pulse pointer-events-none" />
          
          {/* 末端冒出的大量白色粒子 */}
          <div className="absolute right-0 top-0 h-full w-1 overflow-visible pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <div
                key={`particle-${i}`}
                className="absolute h-1 w-1 bg-white rounded-full animate-particle-burst-reverse shadow-[0_0_4px_rgba(255,255,255,0.8)]"
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  animationDelay: `${(i * 0.15)}s`,
                  animationDuration: `${0.8 + Math.random() * 0.4}s`,
                }}
              />
            ))}
          </div>
        </>
      )}
    </ProgressPrimitive.Indicator>
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
