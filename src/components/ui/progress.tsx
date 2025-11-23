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
        "h-full w-full flex-1 transition-all relative overflow-hidden",
        gradient ? "" : "bg-primary"
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    >
      {gradient && (
        <>
          {/* Static blue to purple gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(210,75%,55%)] via-[hsl(240,75%,52%)] to-[hsl(271,81%,56%)]" />

          {/* Edge glow effect */}
          {value && value > 0 && (
            <>
              <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-white/40 via-white/20 to-transparent pointer-events-none" />
              <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white/60 to-transparent animate-pulse pointer-events-none" />
            </>
          )}
        </>
      )}
    </ProgressPrimitive.Indicator>
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
