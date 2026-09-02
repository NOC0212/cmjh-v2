import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Star,
  Download,
  Megaphone,
  Utensils,
  Calendar,
  Globe,
  Github,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { markFirstTimeSetupCompleted, updateVersionToLatest } from "@/lib/app-version";
import { useVisitCounter } from "@/hooks/use-visit-counter";
import { useSiteConfig } from "@/hooks/use-site-config";
import { useSettings } from "@/hooks/settings-context";
import { cn } from "@/lib/utils";

/** /home 登陸頁 */
export default function LandingPage() {
  const navigate = useNavigate();
  const { total: visitTotal, today: visitToday, isConfigured } = useVisitCounter();
  const { appVersion } = useSiteConfig();
  const { settings, setThemeMode } = useSettings();

  const isDarkMode = settings.themeMode === "dark";

  const toggleTheme = () => {
    setThemeMode(isDarkMode ? "light" : "dark");
  };

  const handleStart = () => {
    markFirstTimeSetupCompleted();
    updateVersionToLatest(appVersion?.latestVersion);
    navigate("/app");
  };

  return (
    <main className="min-h-screen w-full bg-background text-foreground overflow-x-hidden">
      {/* 頂部導航 */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 pointer-events-none">
        <div className="glass-strong pointer-events-auto flex items-center justify-between w-full max-w-3xl rounded-2xl px-4 py-2 shadow-md">
          <div className="flex items-center gap-2">
            <img src="/favicon.png" alt="logo" className="w-7 h-7" />
            <span className="font-semibold tracking-tight text-sm">CMJH-V2</span>
            <div className="flex items-center gap-1 ml-2">
              <Link
                to="/home"
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                  "text-primary bg-primary/10",
                )}
              >
                首頁
              </Link>
              <Link
                to="/docs"
                className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                文檔
              </Link>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl">
            {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* 環境背景光圈（品牌色） */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/2 -left-16 md:top-[45%] md:-left-20 w-[200px] h-[200px] md:w-[350px] md:h-[350px] rounded-full bg-primary/15 blur-[80px] md:blur-[100px]" />
        <div className="absolute -top-8 -right-8 w-[200px] h-[200px] md:w-[350px] md:h-[350px] rounded-full bg-primary/10 blur-[80px] md:blur-[100px]" />
      </div>

      {/* ─── 主視覺 ─────────────────────────────────────────────────────────── */}
      <div className="relative z-10 min-h-screen w-full flex flex-col items-center justify-center pt-24 p-4 sm:p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-7xl flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 text-center lg:text-left"
        >
          {/* 文字內容 */}
          <div className="space-y-6 sm:space-y-8 max-w-2xl">
            <div>
              <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 text-xs sm:text-sm font-bold border-2 border-cyan-600/30 dark:border-cyan-500/30 mb-4 sm:mb-6 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                v2.0.0 正式推出
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
              <h1 className="text-[2.5rem] sm:text-5xl md:text-7xl font-semibold tracking-tighter leading-none mb-4 sm:mb-6 flex flex-col drop-shadow-sm break-keep">
                <div className="inline-block pb-2 sm:pb-3 leading-tight">
                  <span className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-400 dark:from-slate-200 dark:via-slate-400 dark:to-slate-500 bg-clip-text text-transparent">
                    校園資訊整合平台
                  </span>
                </div>
                <span className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 dark:from-cyan-400 dark:via-teal-400 dark:to-emerald-400 bg-clip-text text-transparent flex items-center justify-center lg:justify-start gap-4">
                  便捷簡易輕量化
                  <div className="h-2 w-24 md:w-48 bg-gradient-to-r from-teal-500 to-transparent rounded-full hidden md:block" />
                </span>
              </h1>
              <p className="text-base sm:text-xl text-muted-foreground font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed">
                重新定義網站，結合現代美學與智能工具。
                探索更直覺、更流暢的體驗。 此為非官方網站，請注意
              </p>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 pt-4">
              <Button
                size="lg"
                className="h-14 sm:h-16 px-8 sm:px-12 text-lg sm:text-xl font-bold rounded-2xl text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 hover:scale-[1.02] active:scale-95 transition-all gap-3 shadow-[0_0_40px_rgba(13,148,136,0.3)]"
                onClick={handleStart}
              >
                立即體驗
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-14 sm:h-16 px-8 sm:px-10 text-lg sm:text-xl font-bold rounded-2xl border-border text-foreground bg-transparent hover:bg-accent hover:scale-[1.02] active:scale-95 transition-all"
                onClick={() => window.open("https://github.com/NOC0212/cmjh-v2", "_blank")}
              >
                <Github className="w-5 h-5 sm:w-6 sm:h-6" />
                GitHub 原始碼
              </Button>
            </div>
          </div>

          {/* 手機預覽圖 */}
          <div className="relative w-[280px] sm:w-80 h-[380px] sm:h-[500px] md:w-[500px] md:h-[650px] flex-shrink-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 bg-brand-soft blur-[80px] rounded-full"
            />
            <motion.img
              src="/phone2.png"
              alt="App Preview Back"
              initial={{ x: 40, y: 40, opacity: 0, rotate: 0 }}
              animate={{ x: 110, y: -40, opacity: 0.9, rotate: 15 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="absolute z-10 w-[90%] h-[90%] object-contain drop-shadow-2xl brightness-95 dark:brightness-80 hidden lg:block"
            />
            <motion.img
              src="/phone.png"
              alt="App Preview Front"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="relative z-20 w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_20px_50px_rgba(13,148,136,0.3)]"
            />
          </div>
        </motion.div>
      </div>

      {/* ─── 功能亮點 Bento Grid ───────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-10 sm:space-y-14">
        <div className="text-center lg:text-left space-y-4">
          <span className="text-teal-600 dark:text-teal-400 font-bold tracking-widest uppercase text-sm flex items-center gap-3 justify-center lg:justify-start">
            <div className="w-8 h-[2px] bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full" /> 功能亮點
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-tight">
            為你打造的
            <br />
            <span className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 dark:from-cyan-400 dark:via-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">校園體驗</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
          {/* 最新公告 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="md:col-span-8 md:row-span-2 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] bg-card border border-border/60 shadow-sm flex flex-col justify-between group transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
              <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 0% 0%, hsl(var(--primary) / 0.12), transparent 60%)" }} />
            </div>
            <div className="space-y-4 relative z-10">
              <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center transition-colors duration-500 group-hover:bg-teal-500/20">
                <Megaphone className="w-6 sm:w-7 h-6 sm:h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-black tracking-tighter">最新公告</h3>
                <p className="text-muted-foreground text-base leading-relaxed max-w-md font-medium">
                  即時同步崇明國中官方網站資訊。自動抓取、精準推播，讓您不再錯過任何重要的校園消息與緊急通知。
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-8 relative z-10">
              <div className="flex -space-x-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-card bg-primary/20 group-hover:bg-brand-gradient transition-all duration-500" />
                ))}
              </div>
              <span className="text-base font-bold text-muted-foreground">50+ 用戶信賴</span>
            </div>
          </motion.div>

          {/* 訪問統計 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="md:col-span-4 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] bg-card border border-border/60 shadow-sm flex flex-col gap-6 transition-all duration-500 relative overflow-hidden group"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
              <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 100% 0%, rgba(139,92,246,0.15), transparent 60%)" }} />
            </div>
            <Download className="w-7 h-7 text-muted-foreground group-hover:text-violet-500 transition-all duration-500 relative z-10" />
            <div className="space-y-4 relative z-10">
              <div className="space-y-1">
                <p className="text-4xl font-black tracking-tighter">{isConfigured ? visitToday : 0}</p>
                <p className="text-sm font-bold text-muted-foreground">今日訪問</p>
              </div>
              <div className="border-t border-border" />
              <div className="space-y-1">
                <p className="text-4xl font-black tracking-tighter flex items-baseline">
                  {isConfigured ? visitTotal : 1000}
                  <span className="text-2xl text-muted-foreground ml-1">+</span>
                </p>
                <p className="text-sm font-bold text-muted-foreground">累積訪問次數</p>
              </div>
            </div>
          </motion.div>

          {/* 評分卡片 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="md:col-span-4 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] bg-card border border-border/60 shadow-sm flex flex-col justify-between transition-all duration-500 relative overflow-hidden group"
          >
            <div className="flex gap-1.5 relative z-10">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className={`w-4 h-4 ${i < 4 ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30 fill-muted-foreground/30"}`} />
              ))}
            </div>
            <h4 className="text-lg font-bold text-muted-foreground mt-2 relative z-10">總體評價</h4>
            <div className="space-y-4 mt-2 relative z-10">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-muted-foreground font-medium">介面美觀度</span>
                <span className="text-xl font-black">4.8<span className="text-muted-foreground font-bold ml-1">/5</span></span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-muted-foreground font-medium">功能實用度</span>
                <span className="text-xl font-black">4.5<span className="text-muted-foreground font-bold ml-1">/5</span></span>
              </div>
            </div>
          </motion.div>

          {/* 午餐菜單 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="md:col-span-5 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] bg-card border border-border/60 shadow-sm space-y-4 transition-all duration-500 relative overflow-hidden group"
          >
            <Utensils className="w-6 sm:w-7 h-6 sm:h-7 text-muted-foreground group-hover:text-emerald-500 transition-all duration-500 relative z-10" />
            <div className="space-y-2 relative z-10">
              <h4 className="text-lg sm:text-xl font-black tracking-tighter">午餐菜單</h4>
              <p className="text-sm font-bold text-muted-foreground leading-relaxed">當日菜色與熱量分析，美味第一手掌握</p>
            </div>
          </motion.div>

          {/* 行事曆 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="md:col-span-3 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] bg-card border border-border/60 shadow-sm space-y-4 transition-all duration-500 relative overflow-hidden group"
          >
            <Calendar className="w-7 h-7 text-muted-foreground group-hover:text-blue-500 transition-all duration-500 relative z-10" />
            <div className="space-y-2 relative z-10">
              <h4 className="text-xl font-black tracking-tighter">校園行事曆</h4>
              <p className="text-sm font-bold text-muted-foreground leading-relaxed">重要時程、考程全面掌握</p>
            </div>
          </motion.div>

          {/* 常用網址 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="md:col-span-4 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] bg-card border border-border/60 shadow-sm space-y-4 transition-all duration-500 relative overflow-hidden group"
          >
            <Globe className="w-7 h-7 text-muted-foreground group-hover:text-cyan-500 transition-all duration-500 relative z-10" />
            <div className="space-y-2 relative z-10">
              <h4 className="text-xl font-black tracking-tighter">常用網址</h4>
              <p className="text-sm font-bold text-muted-foreground leading-relaxed">收錄最常用的各類校園系統</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── 開源區塊 ───────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-6 sm:p-12 md:p-16 rounded-2xl sm:rounded-[2rem] bg-card border border-border/60 shadow-sm relative overflow-hidden"
        >
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-5">
                <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs sm:text-sm font-bold border border-cyan-500/20">
                  <Github className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Open Source
                </span>
                <div className="space-y-2">
                  <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-tight">
                    完全開源
                    <br />
                    <span className="text-teal-500 dark:text-teal-400">社群驅動</span>
                  </h2>
                </div>
                <p className="text-muted-foreground text-base sm:text-lg font-medium leading-relaxed max-w-md">
                  CMJH-V2 以開源為核心理念，程式碼公開可審視、可貢獻。每一次改進，都來自社群的力量。
                </p>
              </div>

              <div className="flex flex-wrap gap-3 sm:gap-4">
                <Button
                  className="h-12 sm:h-14 px-6 sm:px-8 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold gap-3 text-base sm:text-lg shadow-xl shadow-teal-500/20 transition-all hover:scale-105 active:scale-95"
                  onClick={() => window.open("https://github.com/NOC0212/cmjh-v2", "_blank")}
                >
                  <Github className="w-5 h-5 sm:w-6 sm:h-6" /> 檢視原始碼
                </Button>
                <Button
                  variant="outline"
                  className="h-12 sm:h-14 px-6 sm:px-8 rounded-2xl border-border bg-transparent font-bold gap-3 text-base sm:text-lg transition-all hover:bg-accent hover:scale-105 active:scale-95 shadow-sm"
                  onClick={() => window.open("https://github.com/NOC0212/cmjh-v2/issues", "_blank")}
                >
                  <Star className="w-5 h-5 sm:w-6 sm:h-6" /> 提出建議
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-6 sm:gap-8 pt-6 border-t border-border">
                <div>
                  <p className="text-2xl sm:text-3xl font-black mb-1 tracking-tighter">100+</p>
                  <p className="text-sm font-bold text-muted-foreground tracking-wider uppercase">GitHub 提交數</p>
                </div>
                <div>
                  <p className="text-3xl font-black mb-1 tracking-tighter">20+</p>
                  <p className="text-sm font-bold text-muted-foreground tracking-wider uppercase">版本數</p>
                </div>
                <div>
                  <p className="text-3xl font-black mb-1 tracking-tighter text-primary">MIT</p>
                  <p className="text-sm font-bold text-muted-foreground tracking-wider uppercase">License</p>
                </div>
              </div>
            </div>

            {/* 控制台 UI */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-brand-soft blur-3xl rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative bg-muted rounded-[2rem] border border-border shadow-2xl overflow-hidden font-mono text-sm leading-relaxed">
                <div className="border-b border-border/50 bg-muted/50 px-6 py-4 flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-destructive/80" />
                    <div className="w-3.5 h-3.5 rounded-full bg-warning/80" />
                    <div className="w-3.5 h-3.5 rounded-full bg-success/80" />
                  </div>
                  <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Console</span>
                </div>
                <div className="p-8 space-y-6 text-foreground/80">
                  <div className="space-y-2">
                    <p className="text-muted-foreground">// 複製儲存庫</p>
                    <p><span className="text-primary font-bold">git</span> clone <span className="text-brand-gradient">https://github.com/NOC0212/cmjh-v2.git</span></p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-muted-foreground">// 安裝依賴</p>
                    <p><span className="text-primary font-bold">npm</span> install</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-muted-foreground">// 啟動開發環境</p>
                    <p><span className="text-primary font-bold">npm</span> run dev</p>
                  </div>
                  <div className="pt-4 flex items-center gap-3 text-success font-bold">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    準備好開始貢獻！
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
