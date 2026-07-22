import { useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw, Download } from "lucide-react";
import { motion, useSpring } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getCurrentVersion, migrateData } from "@/lib/app-version";
import { useSettings } from "@/hooks/SettingsContext";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function UpdatePrompt({ isHidden = false }: { isHidden?: boolean }) {
  const [show, setShow] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"downloading" | "installing">("downloading");
  const currentVersion = getCurrentVersion();
  const { settings } = useSettings();
  const { appVersion, isLoading } = useSiteConfig();

  // 只有在成功從伺服器取得版本資料時才顯示更新提示
  // 離線時 appVersion 為 null，不會誤用 FALLBACK_VERSION 顯示降級更新
  const serverVersion = appVersion?.latestVersion;
  const latestVersion = serverVersion || "";
  const hasServerData = appVersion !== null && !isLoading;
  const releaseHighlights = appVersion?.releaseHighlights || [
    "修復編碼", "時鐘功能更新", "隨機轉盤優化", "添加MIT授權"
  ];

  useEffect(() => {
    if (currentVersion && latestVersion && currentVersion !== latestVersion && !settings.disableUpdatePrompt && hasServerData) {
      setShow(true);
    } else {
      setShow(false);
    }

    const handleShowUpdate = () => {
      if (!settings.disableUpdatePrompt && hasServerData) setShow(true);
    };

    window.addEventListener("show-update-prompt", handleShowUpdate);
    return () => window.removeEventListener("show-update-prompt", handleShowUpdate);
  }, [currentVersion, settings.disableUpdatePrompt, latestVersion, hasServerData]);

  const versionSummary = useMemo(
    () => ({ from: currentVersion || "舊版", to: latestVersion }),
    [currentVersion, latestVersion]
  );

  // Smooth spring animation for organic-feeling percentage display
  const displayProgress = useSpring(0, { stiffness: 55, damping: 15 });
  const progressRef = useRef(0);
  const [displayedPct, setDisplayedPct] = useState(0);

  useEffect(() => {
    const unsubscribe = displayProgress.on("change", (v) => {
      setDisplayedPct(Math.round(v));
    });
    return unsubscribe;
  }, [displayProgress]);

  if (!show || isHidden) return null;

  const closePrompt = () => {
    setShow(false);
    window.dispatchEvent(new CustomEvent("update-prompt-closed"));
  };

  const handleUpdate = () => {
    setIsUpdating(true);
    setPhase("downloading");
    setProgress(0);
    displayProgress.set(0);
    progressRef.current = 0;

    const startTime = Date.now();
    const downloadDuration = 6000;

    // Cubic ease-in-out: starts slow, speeds up mid-way, slows at end
    const easeInOutCubic = (t: number) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const rawT = Math.min(elapsed / downloadDuration, 1);

      if (elapsed < downloadDuration) {
        // Base progress with smooth acceleration & deceleration
        const baseProgress = easeInOutCubic(rawT) * 100;

        // Organic speed variation using sine waves to simulate network fluctuation
        const variation =
          Math.sin(elapsed / 700) * 1.8 +
          Math.sin(elapsed / 1600) * 1.2;

        let finalProgress = baseProgress + variation;
        // Prevent visible backward jumps
        finalProgress = Math.max(finalProgress, progressRef.current - 0.3);
        finalProgress = Math.min(finalProgress, 99.5);

        progressRef.current = finalProgress;
        setProgress(finalProgress);
        displayProgress.set(finalProgress);
      } else {
        clearInterval(timer);
        displayProgress.set(100);
        setProgress(100);
        setPhase("installing");
        setTimeout(() => {
          migrateData(latestVersion);
          window.location.reload();
        }, 3000);
      }
    }, 50);
  };

  // Square progress ring perimeter: rect x=2 y=2 w=76 h=76 rx=16
  // perimeter = 2*(76+76) - 8*16 + 2*PI*16 ≈ 277
  const svgPerimeter = 277;

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
          <div className="p-8 sm:p-10">
            {/* 頂部：icon（含方形進度條）+ 名稱與版本 */}
            <div className="flex items-start gap-5 mb-8">
              <div className="shrink-0 relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm overflow-hidden">
                  <img src="/favicon.png" alt="App Icon" className="w-14 h-14" />
                </div>
                {/* 方形進度條 SVG 疊加 */}
                {phase === "downloading" && (
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 80 80">
                    {/* 背景軌道 */}
                    <rect
                      x="2" y="2" width="76" height="76" rx="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-primary/10"
                    />
                    {/* 進度指示 */}
                    <motion.rect
                      x="2" y="2" width="76" height="76" rx="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={svgPerimeter}
                      animate={{ strokeDashoffset: svgPerimeter - (svgPerimeter * progress) / 100 }}
                      transition={{ type: "spring", bounce: 0, duration: 0.1 }}
                      className="text-primary"
                    />
                  </svg>
                )}
                {phase === "installing" && (
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 80 80">
                    {/* 滿格綠色邊框 */}
                    <rect
                      x="2" y="2" width="76" height="76" rx="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray={svgPerimeter}
                      strokeDashoffset={0}
                      className="text-green-500"
                    />
                  </svg>
                )}
              </div>
              <div className="min-w-0 flex-1 pt-1.5">
                <h2 className="text-2xl font-bold tracking-tight text-foreground truncate">崇明國中 V2</h2>
                <div className="flex items-center gap-2.5 mt-2">
                  <span className="inline-flex items-center gap-1.5 text-base text-muted-foreground">
                    {versionSummary.from}
                  </span>
                  <span className="text-xs text-primary font-semibold">→</span>
                  <span className="text-sm font-semibold text-primary">{versionSummary.to}</span>
                </div>
              </div>
            </div>

            {/* 更新資訊 */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-5">最新功能</h3>
              <ul className="space-y-4">
                {releaseHighlights.map((item) => (
                  <li key={item} className="flex items-start gap-3.5 text-base text-foreground/85">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary/60" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 更新按鈕 — 顯示進度 */}
            <Button disabled className="h-14 w-full gap-2.5 text-lg font-bold rounded-xl opacity-80 cursor-not-allowed">
              {phase === "installing" ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="shrink-0"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </motion.div>
                  安裝中...
                </>
              ) : (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="shrink-0"
                  >
                    <Download className="h-5 w-5" />
                  </motion.div>
                  更新中 {displayedPct}%
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="p-8 sm:p-10">
            {/* 頂部：icon + 名稱與版本 */}
            <div className="flex items-start gap-5 mb-8">
              <div className="shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm overflow-hidden">
                  <img src="/favicon.png" alt="App Icon" className="w-14 h-14" />
                </div>
              </div>
              <div className="min-w-0 flex-1 pt-1.5">
                <h2 className="text-2xl font-bold tracking-tight text-foreground truncate">崇明國中 V2</h2>
                <div className="flex items-center gap-2.5 mt-2">
                  <span className="inline-flex items-center gap-1.5 text-base text-muted-foreground">
                    {versionSummary.from}
                    <span className="text-[10px] font-medium text-muted-foreground/60 border border-border rounded-md px-1.5 py-0.5">已安裝</span>
                  </span>
                  <span className="text-xs text-primary font-semibold">→</span>
                  <span className="text-sm font-semibold text-primary">{versionSummary.to}</span>
                </div>
              </div>
            </div>

            {/* 更新資訊（移到按鈕上方） */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-5">最新功能</h3>
              <ul className="space-y-4">
                {releaseHighlights.map((item) => (
                  <li key={item} className="flex items-start gap-3.5 text-base text-foreground/85">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary/60" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 更新按鈕（移到更新資訊下方） */}
            <Button
              className="h-14 w-full gap-2.5 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 transition-transform hover:scale-[1.01] active:scale-[0.98]"
              onClick={handleUpdate}
            >
              <RefreshCw className="h-5 w-5" />
              更新
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
