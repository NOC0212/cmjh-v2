import { motion } from "framer-motion";
import { Check, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { UpdateInfo } from "@/hooks/useAutoUpdate";

interface UpdateDialogProps {
  open: boolean;
  updateInfo: UpdateInfo | null;
  onClose: () => void;
}

export function UpdateDialog({ open, updateInfo, onClose }: UpdateDialogProps) {
  if (!updateInfo) return null;

  const { fromVersion, toVersion, highlights } = updateInfo;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "w-[92vw] max-w-md overflow-hidden rounded-3xl border-border bg-card p-0 shadow-2xl outline-none",
          "[&>button]:right-4 [&>button]:top-4 [&>button]:flex [&>button]:h-8 [&>button]:w-8 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:bg-black/20 [&>button]:text-white [&>button]:backdrop-blur-md hover:[&>button]:bg-black/40"
        )}
      >
        <DialogTitle className="sr-only">版本更新</DialogTitle>

        <div className="p-8 sm:p-10">
          {/* 頂部：圖示 + 名稱與版本 */}
          <div className="flex items-start gap-5 mb-8">
            <div className="shrink-0">
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm overflow-hidden">
                <img src="/favicon.png" alt="App Icon" className="w-14 h-14" />
                {/* 綠色勾勾表示更新完成 */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.3 }}
                  className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 shadow-lg"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} className="h-3.5 w-3.5">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              </div>
            </div>
            <div className="min-w-0 flex-1 pt-1.5">
              <h2 className="text-2xl font-bold tracking-tight text-foreground truncate">
                崇明國中 V2
              </h2>
              <div className="flex items-center gap-2.5 mt-2">
                <span className="inline-flex items-center gap-1.5 text-base text-muted-foreground">
                  {fromVersion}
                </span>
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xs text-primary font-semibold"
                >
                  →
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm font-semibold text-primary"
                >
                  {toVersion}
                </motion.span>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-1.5 mt-2 text-[11px] text-green-600 dark:text-green-400 font-medium"
              >
                <RefreshCw className="h-3 w-3" />
                已自動更新完成
              </motion.div>
            </div>
          </div>

          {/* 更新內容 */}
          {highlights.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-5">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  最新功能
                </h3>
              </div>
              <ul className="space-y-4">
                {highlights.map((item, index) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.08 }}
                    className="flex items-start gap-3.5 text-base text-foreground/85"
                  >
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary/60" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          {/* 無更新內容時的佔位 */}
          {highlights.length === 0 && (
            <div className="mb-8 rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-center">
              <Sparkles className="mx-auto mb-2 h-6 w-6 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground/60">本次更新包含效能優化與錯誤修復</p>
            </div>
          )}

          {/* 關閉按鈕 */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <Button
              className="h-14 w-full gap-2.5 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 transition-transform hover:scale-[1.01] active:scale-[0.98]"
              onClick={onClose}
            >
              <Check className="h-5 w-5" />
              我知道了
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
