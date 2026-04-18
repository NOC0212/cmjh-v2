import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getCurrentVersion, LATEST_VERSION, migrateData } from "@/lib/app-version";
import { useSettings } from "@/hooks/SettingsContext";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const RELEASE_HIGHLIGHTS = ["適配新版網站","行政公告及午餐組件UI更新", "彈窗組件UI更新"];

export function UpdatePrompt({ isHidden = false }: { isHidden?: boolean }) {
  const [show, setShow] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const currentVersion = getCurrentVersion();
  const { settings } = useSettings();

  useEffect(() => {
    if (currentVersion && currentVersion !== LATEST_VERSION && !settings.disableUpdatePrompt) {
      setShow(true);
    } else {
      setShow(false);
    }

    const handleShowUpdate = () => {
      if (!settings.disableUpdatePrompt) setShow(true);
    };

    window.addEventListener("show-update-prompt", handleShowUpdate);
    return () => window.removeEventListener("show-update-prompt", handleShowUpdate);
  }, [currentVersion, settings.disableUpdatePrompt]);

  const versionSummary = useMemo(
    () => ({ from: currentVersion || "舊版", to: LATEST_VERSION }),
    [currentVersion]
  );

  if (!show || isHidden) return null;

  const closePrompt = () => {
    setShow(false);
    window.dispatchEvent(new CustomEvent("update-prompt-closed"));
  };

  const handleUpdate = () => {
    setIsUpdating(true);
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            migrateData();
            window.location.reload();
          }, 500);
          return 100;
        }
        let increment = 0.8;
        if (prev >= 80 && prev < 85) increment = 0.05;
        if (prev >= 85) increment = 1.5;
        return Math.min(prev + increment, 100);
      });
    }, 30);
  };

  return (
    <Dialog
      open={show}
      onOpenChange={(open) => {
        if (isUpdating) return;
        if (!open) {
          closePrompt();
        } else {
          setShow(true);
        }
      }}
    >
      <DialogContent
        className={cn(
          "w-[92vw] max-w-md overflow-hidden rounded-3xl border-border bg-card p-0 shadow-2xl outline-none",
          isUpdating && "[&>button]:hidden",
          !isUpdating && "[&>button]:right-4 [&>button]:top-4 [&>button]:flex [&>button]:h-8 [&>button]:w-8 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:bg-black/20 [&>button]:text-white [&>button]:backdrop-blur-md hover:[&>button]:bg-black/40 focus:[&>button]:ring-0"
        )}
        onPointerDownOutside={(e) => isUpdating && e.preventDefault()}
        onEscapeKeyDown={(e) => isUpdating && e.preventDefault()}
      >
        <DialogTitle className="sr-only">版本更新</DialogTitle>

        {isUpdating ? (
          <div className="flex flex-col items-center justify-center gap-10 p-12 text-center">
            <div className="relative h-32 w-32">
              {/* Circular Background */}
              <svg className="h-full w-full -rotate-90 transform">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-primary/10"
                />
                {/* Progress Circle */}
                <motion.circle
                  cx="64"
                  cy="64"
                  r="58"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={364.4}
                  initial={{ strokeDashoffset: 364.4 }}
                  animate={{ strokeDashoffset: 364.4 - (364.4 * progress) / 100 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.1 }}
                  strokeLinecap="round"
                  className="text-primary"
                />
              </svg>

              {/* Icon in Center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <img
                    src="/favicon.png"
                    alt="App Icon"
                    className={cn(
                      "h-16 w-16 rounded-2xl shadow-lg transition-transform duration-500",
                      progress < 100 ? "scale-100" : "scale-110"
                    )}
                  />
                  {progress >= 100 && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white shadow-lg border-2 border-card"
                    >
                      <Check className="h-5 w-5" />
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-black tracking-tight text-foreground">
                {progress < 100 ? "正在更新..." : "更新完成"}
              </h2>
              <p className="text-lg font-mono font-medium text-primary">
                {Math.round(progress)}%
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="relative h-48 w-full overflow-hidden bg-muted sm:h-56">
              <img 
                src="/update.png" 
                alt="Update Header" 
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent pointer-events-none" />
            </div>

            <div className="p-6 sm:px-8">
              <div className="mb-6 flex items-center justify-center gap-3 text-sm font-medium">
                <span className="rounded-md bg-muted px-3 py-1.5 text-muted-foreground">{versionSummary.from}</span>
                <span className="text-primary">→</span>
                <span className="rounded-md bg-primary/10 px-3 py-1.5 text-primary">{versionSummary.to}</span>
              </div>
              
              <ul className="space-y-4 text-base text-foreground/90">
                {RELEASE_HIGHLIGHTS.map((item, index) => (
                  <li key={item} className="flex items-start gap-4">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 pt-2 pb-8 sm:px-8">
              <Button className="h-12 w-full gap-2 text-lg font-bold shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-[0.98]" onClick={handleUpdate}>
                <RefreshCw className="h-5 w-5" />
                立即更新
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
