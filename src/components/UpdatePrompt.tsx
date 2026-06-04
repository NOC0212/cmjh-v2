import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Check, Download, FileCode } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getCurrentVersion, FALLBACK_VERSION, migrateData } from "@/lib/app-version";
import { useSettings } from "@/hooks/SettingsContext";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function UpdatePrompt({ isHidden = false }: { isHidden?: boolean }) {
  const [show, setShow] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"downloading" | "applying" | "complete">("downloading");
  const currentVersion = getCurrentVersion();
  const { settings } = useSettings();
  const { appVersion } = useSiteConfig();

  const latestVersion = appVersion?.latestVersion || FALLBACK_VERSION;
  const releaseHighlights = appVersion?.releaseHighlights || [
    "修復編碼", "時鐘功能更新", "隨機轉盤優化", "添加MIT授權"
  ];

  useEffect(() => {
    if (currentVersion && currentVersion !== latestVersion && !settings.disableUpdatePrompt) {
      setShow(true);
    } else {
      setShow(false);
    }

    const handleShowUpdate = () => {
      if (!settings.disableUpdatePrompt) setShow(true);
    };

    window.addEventListener("show-update-prompt", handleShowUpdate);
    return () => window.removeEventListener("show-update-prompt", handleShowUpdate);
  }, [currentVersion, settings.disableUpdatePrompt, latestVersion]);

  const versionSummary = useMemo(
    () => ({ from: currentVersion || "舊版", to: latestVersion }),
    [currentVersion, latestVersion]
  );

  if (!show || isHidden) return null;

  const closePrompt = () => {
    setShow(false);
    window.dispatchEvent(new CustomEvent("update-prompt-closed"));
  };

  const handleUpdate = () => {
    setIsUpdating(true);
    setPhase("downloading");
    const startTime = Date.now();
    const totalDuration = 8500; // 8.5 秒
    const phase1End = 5500;     // 階段一：下載（5.5 秒）
    const phase1Max = 65;       // 階段一進度：0 → 65%

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;

      if (elapsed < phase1End) {
        // Phase 1: 正在下載更新
        setProgress((elapsed / phase1End) * phase1Max);
      } else if (elapsed < totalDuration) {
        // Phase 2: 正在套用更新
        setPhase("applying");
        const phase2Elapsed = elapsed - phase1End;
        const phase2Duration = totalDuration - phase1End;
        setProgress(phase1Max + (phase2Elapsed / phase2Duration) * (100 - phase1Max));
      } else {
        clearInterval(timer);
        setProgress(100);
        setPhase("complete");
        setTimeout(() => {
          migrateData(latestVersion);
          window.location.reload();
        }, 500);
      }
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

        {isUpdating ? (            <div className="flex flex-col items-center justify-center gap-10 p-12 text-center">
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
                  className={cn(
                    "transition-colors duration-500",
                    phase === "downloading" && "text-primary",
                    phase === "applying" && "text-amber-500",
                    phase === "complete" && "text-green-500"
                  )}
                />
              </svg>

              {/* Icon in Center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {phase === "complete" ? (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", bounce: 0.5, duration: 0.5 }}
                      className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500 text-white shadow-lg"
                    >
                      <Check className="h-10 w-10" />
                    </motion.div>
                  ) : phase === "applying" ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                      className="flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 shadow-lg"
                    >
                      <FileCode className="h-10 w-10" />
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-lg"
                    >
                      <Download className="h-10 w-10" />
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-black tracking-tight text-foreground">
                {phase === "downloading" && "正在下載更新..."}
                {phase === "applying" && "正在套用更新..."}
                {phase === "complete" && "更新完成"}
              </h2>
              {phase !== "complete" && (
                <p className="text-lg font-mono font-medium text-primary">
                  {Math.round(progress)}%
                </p>
              )}
              {phase === "downloading" && (
                <p className="text-xs text-muted-foreground">
                  正在下載最新版本的更新檔案
                </p>
              )}
              {phase === "applying" && (
                <p className="text-xs text-muted-foreground animate-pulse">
                  正在將更新套用至您的裝置，請勿關閉此頁面
                </p>
              )}
              {phase === "complete" && (
                <p className="text-xs text-green-500 font-medium">
                  更新已成功套用，即將重新整理頁面
                </p>
              )}
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
                {releaseHighlights.map((item, index) => (
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
