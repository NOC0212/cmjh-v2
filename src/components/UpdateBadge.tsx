import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { getCurrentVersion } from "@/lib/app-version";

interface UpdateBadgeProps {
  latestVersion: string | null;
}

/** 背景更新狀態指示器 */
export function UpdateBadge({ latestVersion }: UpdateBadgeProps) {
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    if (!latestVersion) return;

    const current = getCurrentVersion();
    if (current && current === latestVersion) {
      setShowBadge(true);
      const timer = setTimeout(() => setShowBadge(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [latestVersion]);

  return (
    <AnimatePresence>
      {showBadge && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.9 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-24 md:bottom-6 right-4 z-50 flex items-center gap-2 rounded-full border border-border/60 bg-card px-3.5 py-2 shadow-lg"
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-success" />
          <span className="text-xs font-medium text-foreground">已是最新版本</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
