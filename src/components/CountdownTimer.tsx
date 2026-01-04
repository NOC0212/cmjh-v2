import { useEffect, useState } from "react";
import { Clock, ChevronLeft, ChevronRight, Plus, Trash2, Settings, Edit, RotateCcw } from "lucide-react";
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

interface CountdownConfig {
  id: string;
  targetDate: Date;
  startDate?: Date;
  label: string;
  progressLabel: string;
  isDefault?: boolean;
}

// 輔助函數：直接輸入台灣時間，自動轉換為正確的 Date 對象
const taiwanTime = (year: number, month: number, day: number, hour = 0, minute = 0, second = 0): Date => {
  return new Date(Date.UTC(year, month - 1, day, hour - 8, minute, second));
};

// 預設倒數計時配置
const getDefaultConfigs = (): CountdownConfig[] => [
  {
    id: "default-1",
    targetDate: taiwanTime(2026, 1, 15, 0, 0, 0),
    startDate: taiwanTime(2025, 11, 29, 0, 0, 0),
    label: "第三次段考倒數 1/15 1/16",
    progressLabel: "上次至本次段考進度條",
    isDefault: true
  },
  {
    id: "default-2",
    targetDate: taiwanTime(2026, 1, 20, 0, 0, 0),
    startDate: taiwanTime(2025, 9, 1, 0, 0, 0),
    label: "結業式 1/20",
    progressLabel: "本學期進度條",
    isDefault: true
  },
  {
    id: "default-3",
    targetDate: taiwanTime(2026, 2, 23, 0, 0, 0),
    startDate: taiwanTime(2026, 1, 21, 0, 0, 0),
    label: "寒假",
    progressLabel: "寒假進度條",
    isDefault: true
  },
  {
    id: "default-4",
    targetDate: taiwanTime(2027, 1, 1, 0, 0, 0),
    startDate: taiwanTime(2026, 1, 1, 0, 0, 0),
    label: "2027年倒數",
    progressLabel: "2026年進度條",
    isDefault: true
  }
];

const STORAGE_KEY = "cmjh-custom-countdowns";

interface StoredCountdownConfig {
  id: string;
  targetDate: string;
  startDate?: string;
  label: string;
  progressLabel: string;
  isDefault?: boolean;
}

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

  // 載入倒計時
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: StoredCountdownConfig[] = JSON.parse(stored);
        const configs = parsed.map((c) => ({
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

  const currentConfig = allCountdowns[currentIndex];
  const { targetDate, startDate, label, progressLabel } = currentConfig || {};

  useEffect(() => {
    if (!currentConfig) return;

    const getTaiwanTime = () => {
      const now = new Date();
      return new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (8 * 60 * 60 * 1000));
    };

    const calculateTimeLeft = () => {
      const taiwanNow = getTaiwanTime();
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
      const taiwanNow = getTaiwanTime();
      const target = targetDate.getTime();
      const start = startDate ? startDate.getTime() : taiwanNow.getTime() - (7 * 24 * 60 * 60 * 1000);
      const total = target - start;
      const elapsed = taiwanNow.getTime() - start;
      const percentage = Math.min(100, Math.max(0, (elapsed / total) * 100));
      return percentage;
    };

    setTimeLeft(calculateTimeLeft());
    setProgress(calculateProgress());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
      setProgress(calculateProgress());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, startDate, currentConfig]);

  const saveToStorage = (configs: CountdownConfig[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configs.map(c => ({
        ...c,
        targetDate: c.targetDate.toISOString(),
        startDate: c.startDate?.toISOString()
      }))));
    } catch (error) {
      console.error("Failed to save countdowns:", error);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + allCountdowns.length) % allCountdowns.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % allCountdowns.length);
  };

  const validateForm = () => {
    if (!formData.label || !formData.targetDate) {
      toast({
        title: "驗證失敗",
        description: "請填寫標題和目標日期",
        variant: "destructive",
      });
      return false;
    }

    const targetDateTime = new Date(formData.targetDate);
    const now = new Date();

    if (targetDateTime <= now) {
      toast({
        title: "驗證失敗",
        description: "目標時間必須晚於當前時間",
        variant: "destructive",
      });
      return false;
    }

    if (formData.startDate) {
      const startDateTime = new Date(formData.startDate);
      if (startDateTime >= targetDateTime) {
        toast({
          title: "驗證失敗",
          description: "開始時間必須早於目標時間",
          variant: "destructive",
        });
        return false;
      }
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

    const newCountdowns = [...allCountdowns, newConfig];
    setAllCountdowns(newCountdowns);
    saveToStorage(newCountdowns);

    setFormData({ label: "", targetDate: "", startDate: "", progressLabel: "" });
    setAddDialogOpen(false);
  };

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
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

    const updatedConfig: CountdownConfig = {
      id: editingId!,
      label: formData.label,
      targetDate: new Date(formData.targetDate),
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      progressLabel: formData.progressLabel || "進度",
      isDefault: allCountdowns.find(c => c.id === editingId)?.isDefault || false
    };

    const newCountdowns = allCountdowns.map(c => c.id === editingId ? updatedConfig : c);
    setAllCountdowns(newCountdowns);
    saveToStorage(newCountdowns);

    setFormData({ label: "", targetDate: "", startDate: "", progressLabel: "" });
    setEditingId(null);
    setAddDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    const newCountdowns = allCountdowns.filter(c => c.id !== id);

    if (newCountdowns.length === 0) {
      const defaults = getDefaultConfigs();
      setAllCountdowns(defaults);
      saveToStorage(defaults);
      setCurrentIndex(0);
    } else {
      setAllCountdowns(newCountdowns);
      saveToStorage(newCountdowns);
      if (currentIndex >= newCountdowns.length) {
        setCurrentIndex(newCountdowns.length - 1);
      }
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newCountdowns = [...allCountdowns];
    [newCountdowns[index - 1], newCountdowns[index]] = [newCountdowns[index], newCountdowns[index - 1]];
    setAllCountdowns(newCountdowns);
    saveToStorage(newCountdowns);

    if (currentIndex === index) setCurrentIndex(index - 1);
    else if (currentIndex === index - 1) setCurrentIndex(index);
  };

  const handleMoveDown = (index: number) => {
    if (index === allCountdowns.length - 1) return;
    const newCountdowns = [...allCountdowns];
    [newCountdowns[index], newCountdowns[index + 1]] = [newCountdowns[index + 1], newCountdowns[index]];
    setAllCountdowns(newCountdowns);
    saveToStorage(newCountdowns);

    if (currentIndex === index) setCurrentIndex(index + 1);
    else if (currentIndex === index + 1) setCurrentIndex(index);
  };

  const handleReset = () => {
    setResetDialogOpen(true);
  };

  const confirmReset = () => {
    const defaults = getDefaultConfigs();
    setAllCountdowns(defaults);
    saveToStorage(defaults);
    setCurrentIndex(0);
    setManageDialogOpen(false);
    setResetDialogOpen(false);
    toast({
      title: "重置成功",
      description: "已重置為預設倒計時",
    });
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
      className="relative w-full max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-primary/20 p-4 shadow-[var(--shadow-card)] md:p-8"
      style={{ background: 'var(--gradient-timer)' }}
    >
      <div className="relative z-10 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent md:text-3xl break-words">
              {label}
            </h2>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                  setEditingId(null);
                  setFormData({ label: "", targetDate: "", startDate: "", progressLabel: "" });
                }}>
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingId ? "編輯倒計時" : "新增倒計時"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="label">標題</Label>
                    <Input id="label" value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })} placeholder="例如：寒假倒數" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetDate">目標日期時間</Label>
                    <Input id="targetDate" type="datetime-local" value={formData.targetDate} onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })} />
                    <p className="text-xs text-muted-foreground">必須晚於當前時間</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">開始日期時間（選填）</Label>
                    <Input id="startDate" type="datetime-local" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                    <p className="text-xs text-muted-foreground">用於計算進度條，必須早於目標時間</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="progressLabel">進度條標籤（選填）</Label>
                    <Input id="progressLabel" value={formData.progressLabel} onChange={(e) => setFormData({ ...formData, progressLabel: e.target.value })} placeholder="例如：學期進度" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setAddDialogOpen(false); setEditingId(null); }}>取消</Button>
                  <Button onClick={editingId ? handleSaveEdit : handleAddNew}>儲存</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>管理倒計時</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-4">
                  {allCountdowns.map((countdown, index) => (
                    <div key={countdown.id} className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-4">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
                          {countdown.label}
                          {countdown.isDefault && <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">預設</span>}
                        </div>
                        <div className="text-xs text-muted-foreground">目標: {formatDate(countdown.targetDate)}</div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(countdown)} className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleMoveUp(index)} disabled={index === 0} className="h-8 w-8">↑</Button>
                        <Button variant="ghost" size="icon" onClick={() => handleMoveDown(index)} disabled={index === allCountdowns.length - 1} className="h-8 w-8">↓</Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(countdown.id)} className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleReset} className="mr-auto gap-2"><RotateCcw className="h-4 w-4" />重置為預設</Button>
                  <Button onClick={() => setManageDialogOpen(false)}>完成</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>確認重置</AlertDialogTitle>
                  <AlertDialogDescription>
                    確定要重置為預設倒計時嗎？這將刪除所有自定義倒計時。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmReset}>確認重置</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex items-center gap-1 rounded-full bg-background/50 px-2 py-1">
              <Button variant="ghost" size="icon" onClick={handlePrevious} className="h-7 w-7"><ChevronLeft className="h-4 w-4" /></Button>
              <span className="px-2 text-xs font-semibold text-primary">{currentIndex + 1} / {allCountdowns.length}</span>
              <Button variant="ghost" size="icon" onClick={handleNext} className="h-7 w-7"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>

        {/* Timer Content */}
        {isComplete ? (
          <div className="rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 py-12 text-center">
            <div className="mb-4 animate-bounce text-6xl">🎉</div>
            <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">時間到！</p>
          </div>
        ) : (
          <>
            <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 lg:gap-4">
              <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-4 text-center md:p-5">
                <div className="mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-3xl font-bold text-transparent md:text-5xl">
                  {timeLeft?.days || 0}
                </div>
                <div className="text-xs font-medium text-muted-foreground md:text-sm">天</div>
              </div>
              <div className="rounded-xl border border-accent/20 bg-gradient-to-br from-accent/10 to-accent/5 p-4 text-center md:p-5">
                <div className="mb-2 bg-gradient-to-r from-accent to-primary bg-clip-text text-3xl font-bold text-transparent md:text-5xl">
                  {timeLeft?.hours || 0}
                </div>
                <div className="text-xs font-medium text-muted-foreground md:text-sm">時</div>
              </div>
              <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-4 text-center md:p-5">
                <div className="mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-3xl font-bold text-transparent md:text-5xl">
                  {timeLeft?.minutes || 0}
                </div>
                <div className="text-xs font-medium text-muted-foreground md:text-sm">分</div>
              </div>
              <div className="rounded-xl border border-accent/20 bg-gradient-to-br from-accent/10 to-accent/5 p-4 text-center md:p-5">
                <div className="mb-2 bg-gradient-to-r from-accent to-primary bg-clip-text text-3xl font-bold text-transparent md:text-5xl">
                  {timeLeft?.seconds || 0}
                </div>
                <div className="text-xs font-medium text-muted-foreground md:text-sm">秒</div>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-border/50 bg-background/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{progressLabel}</span>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">{progress.toFixed(1)}%</span>
              </div>
              <Progress value={progress} className="h-3" gradient />
            </div>
          </>
        )}
      </div>
    </div >
  );
}
