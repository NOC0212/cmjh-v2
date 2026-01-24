import { useEffect, useState } from "react";
import { Clock, ChevronLeft, ChevronRight, Plus, Trash2, Settings, Edit, RotateCcw, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Reorder, AnimatePresence, motion } from "framer-motion";

interface CountdownConfig {
  id: string;
  targetDate: Date;
  startDate?: Date;
  label: string;
  progressLabel: string;
  isDefault?: boolean;
}

// 輔助函數：獲取當前台灣時間
const getTaiwanNow = () => {
  const now = new Date();
  return new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (8 * 60 * 60 * 1000));
};

// 輔助函數：直接輸入台灣時間，自動轉換為正確的 Date 對象
const taiwanTime = (year: number, month: number, day: number, hour = 0, minute = 0, second = 0): Date => {
  return new Date(Date.UTC(year, month - 1, day, hour - 8, minute, second));
};

// 預設倒數計時配置
const getDefaultConfigs = (): CountdownConfig[] => [
  {
    id: "default-1",
    targetDate: taiwanTime(2026, 2, 23, 0, 0, 0),
    startDate: taiwanTime(2026, 1, 24, 0, 0, 0),
    label: "寒假",
    progressLabel: "寒假進度條",
    isDefault: true
  },
  {
    id: "default-2",
    targetDate: taiwanTime(2027, 1, 1, 0, 0, 0),
    startDate: taiwanTime(2026, 1, 1, 0, 0, 0),
    label: "2027年倒數",
    progressLabel: "2026年進度條",
    isDefault: true
  }
];

const STORAGE_KEY = "cmjh-custom-countdowns";

export function CountdownTimer() {
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [progress, setProgress] = useState(0);
  const [direction, setDirection] = useState(0);
  const [allCountdowns, setAllCountdowns] = useState<CountdownConfig[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    label: "",
    targetDate: "",
    startDate: "",
    progressLabel: ""
  });

  // 載入倒計時 (初始化)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const configs = parsed.map((c: any) => ({
          ...c,
          targetDate: new Date(c.targetDate),
          startDate: c.startDate ? new Date(c.startDate) : undefined,
        }));
        setAllCountdowns(configs);
      } catch (error) {
        console.error("Failed to load countdowns:", error);
        setAllCountdowns(getDefaultConfigs());
      }
    } else {
      setAllCountdowns(getDefaultConfigs());
    }
  }, []);

  // 自動持久化儲存
  useEffect(() => {
    if (allCountdowns.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allCountdowns.map(c => ({
        ...c,
        targetDate: c.targetDate.toISOString(),
        startDate: c.startDate?.toISOString()
      }))));
    }
  }, [allCountdowns]);

  const currentConfig = allCountdowns[currentIndex];
  const { targetDate, startDate, label, progressLabel } = currentConfig || {};

  useEffect(() => {
    if (!currentConfig) return;

    const calculateTimeLeft = () => {
      const taiwanNow = getTaiwanNow();
      const difference = targetDate.getTime() - taiwanNow.getTime();

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return null;
    };

    const calculateProgress = () => {
      const taiwanNow = getTaiwanNow();
      const target = targetDate.getTime();
      const start = startDate ? startDate.getTime() : taiwanNow.getTime() - (7 * 24 * 60 * 60 * 1000);
      const total = target - start;
      const elapsed = taiwanNow.getTime() - start;
      return Math.min(100, Math.max(0, (elapsed / total) * 100));
    };

    setTimeLeft(calculateTimeLeft());
    setProgress(calculateProgress());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
      setProgress(calculateProgress());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, startDate, currentConfig]);

  const handlePrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + allCountdowns.length) % allCountdowns.length);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % allCountdowns.length);
  };

  const validateForm = () => {
    if (!formData.label || !formData.targetDate) {
      toast({ title: "驗證失敗", description: "請填寫標題和目標日期", variant: "destructive" });
      return false;
    }

    const targetDateTime = new Date(formData.targetDate);
    if (targetDateTime <= new Date()) {
      toast({ title: "驗證失敗", description: "目標時間必須晚於當前時間", variant: "destructive" });
      return false;
    }

    if (formData.startDate && new Date(formData.startDate) >= targetDateTime) {
      toast({ title: "驗證失敗", description: "開始時間必須早於目標時間", variant: "destructive" });
      return false;
    }

    return true;
  };

  const handleAddNew = () => {
    if (!validateForm()) return;

    const newConfig: CountdownConfig = {
      id: `custom-${Date.now()}`,
      label: formData.label,
      targetDate: new Date(formData.targetDate),
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      progressLabel: formData.progressLabel || "進度",
      isDefault: false
    };

    setAllCountdowns(prev => [...prev, newConfig]);
    setFormData({ label: "", targetDate: "", startDate: "", progressLabel: "" });
    setAddDialogOpen(false);
  };

  const formatDateForInput = (date: Date): string => {
    const d = new Date(date.getTime() + (8 * 60 * 60 * 1000)); // 轉換回 UTC+8 顯示在 input
    return d.toISOString().slice(0, 16);
  };

  const handleEdit = (countdown: CountdownConfig) => {
    setEditingId(countdown.id);
    setFormData({
      label: countdown.label,
      targetDate: formatDateForInput(countdown.targetDate),
      startDate: countdown.startDate ? formatDateForInput(countdown.startDate) : "",
      progressLabel: countdown.progressLabel
    });
    setAddDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!validateForm()) return;

    setAllCountdowns(prev => prev.map(c => c.id === editingId ? {
      ...c,
      label: formData.label,
      targetDate: new Date(formData.targetDate),
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      progressLabel: formData.progressLabel || "進度"
    } : c));

    setFormData({ label: "", targetDate: "", startDate: "", progressLabel: "" });
    setEditingId(null);
    setAddDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setAllCountdowns(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (filtered.length === 0) return getDefaultConfigs();
      return filtered;
    });

    if (currentIndex >= allCountdowns.length - 1) {
      setCurrentIndex(Math.max(0, allCountdowns.length - 2));
    }
  };

  const handleReorder = (newCountdowns: CountdownConfig[]) => {
    const currentId = allCountdowns[currentIndex]?.id;
    const newIndex = newCountdowns.findIndex(c => c.id === currentId);
    setAllCountdowns(newCountdowns);
    if (newIndex !== -1) setCurrentIndex(newIndex);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newCountdowns = [...allCountdowns];
    [newCountdowns[index], newCountdowns[index - 1]] = [newCountdowns[index - 1], newCountdowns[index]];
    handleReorder(newCountdowns);
  };

  const handleMoveDown = (index: number) => {
    if (index === allCountdowns.length - 1) return;
    const newCountdowns = [...allCountdowns];
    [newCountdowns[index], newCountdowns[index + 1]] = [newCountdowns[index + 1], newCountdowns[index]];
    handleReorder(newCountdowns);
  };

  const handleReset = () => setResetDialogOpen(true);

  const confirmReset = () => {
    const defaults = getDefaultConfigs();
    setAllCountdowns(defaults);
    setCurrentIndex(0);
    setManageDialogOpen(false);
    setResetDialogOpen(false);
    toast({ title: "重置成功", description: "已重置為預設倒計時" });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('zh-TW', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  const isComplete = progress >= 100;

  if (!currentConfig) return null;

  return (
    <div
      className="relative w-full max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-primary/20 p-6 shadow-2xl backdrop-blur-xl md:p-10"
      style={{
        background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--accent-light) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
    >
      {/* 裝飾性背景磨砂玻璃元素 */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-6 md:gap-8">
        {/* 標題 - 針對行動裝置進行優化 */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 shadow-inner">
              <Clock className="h-6 w-6 text-primary animate-[pulse_2s_infinite]" />
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-2xl font-black tracking-tight text-primary md:bg-gradient-to-r md:from-primary md:via-primary md:to-accent md:bg-clip-text md:text-transparent md:text-4xl break-words leading-tight">
                {label}
              </h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 md:text-xs">
                倒數計時器
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10 border-primary/20 bg-background/40 backdrop-blur-sm hover:bg-primary/10 rounded-xl" onClick={() => {
                  setEditingId(null);
                  setFormData({ label: "", targetDate: "", startDate: "", progressLabel: "" });
                }}>
                  <Plus className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md rounded-3xl border-primary/20 bg-background dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">{editingId ? "編輯倒計時" : "新增倒計時"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-5 py-6">
                  <div className="space-y-2">
                    <Label htmlFor="label" className="text-sm font-bold ml-1">標題</Label>
                    <Input id="label" className="rounded-xl border-primary/10 bg-muted/30" value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })} placeholder="例如：寒假倒數" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetDate" className="text-sm font-bold ml-1">目標日期時間</Label>
                    <Input id="targetDate" type="datetime-local" className="rounded-xl border-primary/10 bg-muted/30" value={formData.targetDate} onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })} />
                    <p className="text-[10px] text-muted-foreground/60 ml-1">必須晚於當前時間</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-sm font-bold ml-1">開始日期時間（選填）</Label>
                    <Input id="startDate" type="datetime-local" className="rounded-xl border-primary/10 bg-muted/30" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                    <p className="text-[10px] text-muted-foreground/60 ml-1">用於計算進度條，必須早於目標時間</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="progressLabel" className="text-sm font-bold ml-1">進度條標籤（選填）</Label>
                    <Input id="progressLabel" className="rounded-xl border-primary/10 bg-muted/30" value={formData.progressLabel} onChange={(e) => setFormData({ ...formData, progressLabel: e.target.value })} placeholder="例如：學期進度" />
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button variant="ghost" className="rounded-xl" onClick={() => { setAddDialogOpen(false); setEditingId(null); }}>取消</Button>
                  <Button className="rounded-xl bg-primary hover:bg-primary/90 px-8 font-bold" onClick={editingId ? handleSaveEdit : handleAddNew}>儲存</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10 border-primary/20 bg-background/40 backdrop-blur-sm hover:bg-primary/10 rounded-xl">
                  <Settings className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] w-[95vw] max-w-lg overflow-hidden flex flex-col p-0 rounded-3xl border-primary/20 bg-background dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl">
                <DialogHeader className="p-6 pb-0">
                  <DialogTitle className="text-2xl font-bold">管理倒計時</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto p-6">
                  <Reorder.Group
                    axis="y"
                    values={allCountdowns}
                    onReorder={handleReorder}
                    className="space-y-4"
                  >
                    {allCountdowns.map((countdown, index) => (
                      <Reorder.Item
                        key={countdown.id}
                        value={countdown}
                        className="group flex items-center gap-3 rounded-2xl border border-primary/10 bg-muted/40 p-4 shadow-sm hover:shadow-md hover:border-primary/20"
                      >
                        <div className="cursor-grab active:cursor-grabbing p-1.5 text-muted-foreground/40 group-hover:text-primary transition-colors">
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="mb-0.5 flex flex-wrap items-center gap-2 text-sm font-bold text-foreground">
                            <span className="truncate">{countdown.label}</span>
                            {countdown.isDefault && <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] text-primary font-black uppercase tracking-tighter">預設</span>}
                          </div>
                          <div className="text-[10px] text-muted-foreground/60 font-mono">
                            {formatDate(countdown.targetDate)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-primary/10"
                            onClick={() => handleEdit(countdown)}
                          >
                            <Edit className="h-4 w-4 text-muted-foreground/70" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-primary/10"
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4 text-muted-foreground/70" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-primary/10"
                            onClick={() => handleMoveDown(index)}
                            disabled={index === allCountdowns.length - 1}
                          >
                            <ChevronDown className="h-4 w-4 text-muted-foreground/70" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive/70 hover:text-destructive"
                            onClick={() => handleDelete(countdown.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                </div>
                <div className="p-6 pt-2 bg-muted/10 border-t border-primary/5">
                  <DialogFooter className="flex-row items-center justify-between gap-4">
                    <Button variant="ghost" onClick={handleReset} className="text-xs font-bold gap-2 text-muted-foreground hover:text-primary rounded-xl px-0"><RotateCcw className="h-3.5 w-3.5" />重置為預設</Button>
                    <Button className="rounded-xl px-8 font-bold" onClick={() => setManageDialogOpen(false)}>完成</Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>

            <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
              <AlertDialogContent className="rounded-3xl border-primary/20">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-bold">確認重置</AlertDialogTitle>
                  <AlertDialogDescription className="text-sm">
                    確定要重置為預設倒計時嗎？這將刪除所有自定義倒計時。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                  <AlertDialogCancel className="rounded-xl border-primary/10">取消</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmReset} className="rounded-xl bg-destructive hover:bg-destructive/90">確認重置</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex items-center gap-1.5 rounded-2xl bg-background/30 backdrop-blur-md border border-primary/10 p-1">
              <Button variant="ghost" size="icon" onClick={handlePrevious} className="h-8 w-8 rounded-xl hover:bg-primary/10"><ChevronLeft className="h-4 w-4" /></Button>
              <div className="min-w-[40px] text-center">
                <span className="text-xs font-black text-primary/80">{currentIndex + 1} <span className="text-muted-foreground font-light mx-0.5">/</span> {allCountdowns.length}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleNext} className="h-8 w-8 rounded-xl hover:bg-primary/10"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>

        {/* 帶有動畫的計時器內容 */}
        <div className="relative overflow-hidden min-h-[280px] md:min-h-[300px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentConfig.id}
              custom={direction}
              initial={{ opacity: 0, x: direction * 50, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -direction * 50, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full flex flex-col gap-8"
            >
              {isComplete ? (
                <div className="relative group rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 py-16 text-center border border-primary/20 shadow-inner overflow-hidden">
                  <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/50" />
                  <div className="relative z-10">
                    <div className="mb-6 animate-bounce text-7xl inline-block">🎉</div>
                    <h3 className="text-4xl font-black bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent italic tracking-tighter">
                      時間到啦！
                    </h3>
                    <p className="mt-2 text-muted-foreground font-bold text-lg">
                      目標時間已達成
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 mt-2">
                  <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:gap-6">
                    {[
                      { label: "天", value: timeLeft?.days || 0, color: "primary" as const },
                      { label: "時", value: timeLeft?.hours || 0, color: "accent" as const },
                      { label: "分", value: timeLeft?.minutes || 0, color: "primary" as const },
                      { label: "秒", value: timeLeft?.seconds || 0, color: "accent" as const }
                    ].map((item, idx) => {
                      const styles = {
                        primary: {
                          container: "border-primary/15 bg-gradient-to-br from-primary/10 to-transparent hover:border-primary/30",
                          glow: "bg-primary/5 group-hover:bg-primary/10",
                          text: "from-primary to-accent"
                        },
                        accent: {
                          container: "border-accent/15 bg-gradient-to-br from-accent/10 to-transparent hover:border-accent/30",
                          glow: "bg-accent/5 group-hover:bg-accent/10",
                          text: "from-accent to-primary"
                        }
                      }; // 設定樣式映射
                      const style = styles[item.color];

                      return (
                        <div key={idx} className={`relative group overflow-hidden rounded-3xl border p-5 text-center transition-all hover:scale-[1.02] hover:shadow-lg md:p-7 ${style.container}`}>
                          <div className={`absolute -right-4 -top-4 h-16 w-16 rounded-full blur-2xl transition-colors ${style.glow}`} />
                          <div className={`mb-1 bg-gradient-to-r bg-clip-text text-4xl font-black tracking-tighter text-transparent md:text-6xl font-mono ${style.text}`}>
                            {(item.value).toString().padStart(2, '0')}
                          </div>
                          <div className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 md:text-xs">
                            {item.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="relative overflow-hidden space-y-4 rounded-3xl border border-primary/10 bg-background/30 backdrop-blur-md p-6 shadow-sm">
                    <div className="flex items-end justify-between">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">進度條</span>
                        <span className="text-lg font-black text-foreground/90">{progressLabel}</span>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">已完成</span>
                        <span className="rounded-full bg-primary/15 px-4 py-1.5 text-base font-black text-primary ring-1 ring-primary/20 shadow-sm">{progress.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="relative">
                      <Progress value={progress} className="h-4 rounded-full bg-primary/5" gradient />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="h-1 w-full bg-white/20 blur-sm rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
