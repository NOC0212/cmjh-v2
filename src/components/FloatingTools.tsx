import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, X, Target, Users, Shuffle, Clock, Timer, QrCode, Pencil, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const tools = [
  { id: "wheel", icon: Target, title: "隨機抽籤", path: "/tools/wheel", color: "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20" },
  { id: "grouping", icon: Users, title: "分組工具", path: "/tools/grouping", color: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" },
  { id: "order", icon: Shuffle, title: "順序工具", path: "/tools/order", color: "bg-violet-500/10 text-violet-500 hover:bg-violet-500/20" },
  { id: "clock", icon: Clock, title: "時鐘", path: "/tools/clock", color: "bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20" },
  { id: "timer", icon: Timer, title: "計時器", path: "/tools/timer", color: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" },
  { id: "qrcode", icon: QrCode, title: "QR Code", path: "/tools/qrcode", color: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20" },
  { id: "whiteboard", icon: Pencil, title: "電子白板", path: "/tools/whiteboard", color: "bg-fuchsia-500/10 text-fuchsia-500 hover:bg-fuchsia-500/20" },
  { id: "attendance", icon: ClipboardCheck, title: "課堂點名", path: "/tools/attendance", color: "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20" },
];

/** 右下角浮動小工具 */
export function FloatingTools() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 路由改變時自動收起
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // 點擊外部收起
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-floating-tools]")) setOpen(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [open]);

  return (
    <div data-floating-tools className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="w-14 grid grid-cols-1 gap-2 p-2 rounded-2xl glass-strong shadow-lg border border-border/40"
          >
            {tools.map((tool, idx) => {
              const Icon = tool.icon;
              return (
                <motion.button
                  key={tool.id}
                  type="button"
                  title={tool.title}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => {
                    navigate(tool.path);
                    setOpen(false);
                  }}
                  className={cn(
                    "group flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 active:scale-90",
                    tool.color,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((v) => !v)}
        title={open ? "收起小工具" : "展開小工具"}
        aria-label={open ? "收起小工具" : "展開小工具"}
        aria-expanded={open}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg shadow-primary/25 text-white transition-all duration-300",
          open
            ? "bg-destructive hover:bg-destructive/90"
            : "bg-brand-gradient hover:opacity-90",
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "open"}
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center"
          >
            {open ? <X className="h-6 w-6" /> : <Wrench className="h-6 w-6" />}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}