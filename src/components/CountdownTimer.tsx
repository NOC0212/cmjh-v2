import { useEffect, useMemo, useRef, useState } from "react";
import { Clock, ChevronLeft, ChevronRight, Plus, Trash2, Settings, Edit, RotateCcw, GripVertical, ChevronUp, ChevronDown, Eye, EyeOff } from "lucide-react";
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
import { useSettings } from "@/hooks/SettingsContext";
import { useToast } from "@/hooks/use-toast";
import { useSiteCountdowns } from "@/hooks/useSiteCountdowns";
import { Reorder, AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const GRADES = [
  { id: "7", label: "七年級", color: "from-blue-500 to-blue-600", bgColor: "from-blue-500/20 to-blue-600/10" },
  { id: "8", label: "八年級", color: "from-emerald-500 to-emerald-600", bgColor: "from-emerald-500/20 to-emerald-600/10" },
  { id: "9", label: "九年級", color: "from-violet-500 to-violet-600", bgColor: "from-violet-500/20 to-violet-600/10" },
] as const;

type GradeId = (typeof GRADES)[number]["id"];

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

// 將 datetime-local input 字串（視為台灣時間）轉為 Date
const parseTaiwanInput = (inputStr: string): Date => {
  return new Date(inputStr + "+08:00");
};

// 輔助函數：處理 Emoji 與漸層文字衝突
const renderLabelWithEmoji = (text: string) => {
  // 使用更全面的正則表達式匹配 Emoji
  const emojiRegex = /(\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]|\ud83e[\udd00-\uddff]|\ud83f[\udc00-\udfff]|[\u2600-\u26FF]|[\u2700-\u27BF]|\u00a9|\u00ae)/g;
  const parts = text.split(emojiRegex);
  
  return parts.map((part, index) => {
    if (emojiRegex.test(part)) {
      // 關鍵修復：補回缺失的 return 並精確重置樣式
      return (
        <span 
          key={index} 
          className="inline-block translate-y-[-1px]"
          style={{ 
            display: 'inline-block',
            opacity: 1,
            color: 'initial',
            background: 'none',
            WebkitBackgroundClip: 'initial',
            WebkitTextFillColor: 'initial',
            fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "Android Emoji", "EmojiSymbols", sans-serif',
            verticalAlign: 'middle'
          }}
        >
          {part}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

const mergeCountdownConfigs = (
  savedConfigs: CountdownConfig[],
  freshDefaults: CountdownConfig[]
): CountdownConfig[] => {
  const defaultMap = new Map(freshDefaults.map(item => [item.id, item]));

  const mergedConfigs = savedConfigs.map(item => {
    if (!item.isDefault) return item;
    return defaultMap.get(item.id);
  }).filter(Boolean) as CountdownConfig[];

  const existingIds = new Set(mergedConfigs.map(item => item.id));
  const missingDefaults = freshDefaults.filter(item => !existingIds.has(item.id));
  return [...mergedConfigs, ...missingDefaults];
};

const CUSTOM_STORAGE_PREFIX = "cmjh-custom-countdowns";
const GRADE_STORAGE_KEY = "cmjh-countdown-grade";
const DISABLED_STORAGE_KEY = "cmjh-disabled-defaults";

const getStorageKey = (grade: GradeId) => `${CUSTOM_STORAGE_PREFIX}-${grade}`;

const loadDisabledDefaultIds = (): Set<string> => {
  try {
    const stored = localStorage.getItem(DISABLED_STORAGE_KEY);
    return new Set<string>(stored ? JSON.parse(stored) : []);
  } catch {
    return new Set<string>();
  }
};

const saveDisabledDefaultIds = (ids: Set<string>) => {
  localStorage.setItem(DISABLED_STORAGE_KEY, JSON.stringify([...ids]));
};

export function CountdownTimer() {
  const { toast } = useToast();
  const { settings } = useSettings();
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

  const [selectedGrade, setSelectedGrade] = useState<GradeId | null>(() => {
    return localStorage.getItem(GRADE_STORAGE_KEY) as GradeId | null;
  });

  const [disabledDefaultIds, setDisabledDefaultIds] = useState<Set<string>>(loadDisabledDefaultIds);

  const toggleDefaultDisabled = (id: string) => {
    setDisabledDefaultIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveDisabledDefaultIds(next);
      return next;
    });
  };

  const storageKey = selectedGrade ? getStorageKey(selectedGrade) : null;

  const handleGradeChange = (grade: GradeId) => {
    // 1. 讀取目標年級的現有資料
    const targetKey = getStorageKey(grade);
    let targetData: CountdownConfig[] = [];
    const targetStored = localStorage.getItem(targetKey);
    if (targetStored) {
      try {
        targetData = JSON.parse(targetStored).map((c: Record<string, unknown>) => ({
          ...c,
          targetDate: new Date(c.targetDate as string),
          startDate: c.startDate ? new Date(c.startDate as string) : undefined,
        }));
      } catch { /* ignore */ }
    }

    // 2. 從當前年級取出自訂項目，附加到目標年級
    const currentCustoms = allCountdowns.filter(c => !c.isDefault);
    if (currentCustoms.length > 0) {
      targetData.push(...currentCustoms);
    }

    // 3. 儲存至目標年級
    if (targetKey) {
      persistToStorage(targetData, targetKey);
    }

    // 4. 清空當前年級的自訂項目（只留預設）
    if (storageKey) {
      const currentDefaults = mergedConfigsRef.current.filter(c => c.isDefault);
      persistToStorage(currentDefaults, storageKey);
      mergedConfigsRef.current = currentDefaults;
    }

    // 5. 切換年級
    localStorage.setItem(GRADE_STORAGE_KEY, grade);
    setSelectedGrade(grade);
    setCurrentIndex(0);
    setFormData({ label: "", targetDate: "", startDate: "", progressLabel: "" });
  };

  const { countdowns: supabaseDefaults, isLoading: supabaseLoading } = useSiteCountdowns();

  // 保留合併後的完整列表（含停用預設），供年級切換時持久化
  const mergedConfigsRef = useRef<CountdownConfig[]>([]);

  const gradeDefaults = useMemo<CountdownConfig[]>(
    () => (supabaseDefaults || [])
      .filter(c => !c.grade || c.grade === selectedGrade)
      .map(c => ({
        id: c.id,
        targetDate: new Date(c.target_date),
        startDate: c.start_date ? new Date(c.start_date) : undefined,
        label: c.label,
        progressLabel: c.progress_label,
        isDefault: true,
      })),
    [supabaseDefaults, selectedGrade]
  );

  // 載入倒數計時 (合併 localStorage 順序 + Supabase 最新資料)
  useEffect(() => {
    if (!storageKey) return;
    const stored = localStorage.getItem(storageKey);
    let savedConfigs: CountdownConfig[] = [];

    // 1. 讀取 localStorage（保留使用者排序）
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        savedConfigs = parsed.map((c: Record<string, unknown>) => ({
          ...c,
          targetDate: new Date(c.targetDate as string),
          startDate: c.startDate ? new Date(c.startDate as string) : undefined,
        }));
      } catch (e) {
        console.error("Local storage parse error:", e);
      }
    }

    // 如果停用預設倒數計時，只載入自訂項目
    if (settings.disableDefaultCountdowns) {
      const customOnly = savedConfigs.filter((c) => !c.isDefault);
      persistToStorage(customOnly, storageKey);
      setAllCountdowns(customOnly);
      return;
    }

    // 2. 如果 Supabase 資料還沒載入，不要合併或持久化（避免清掉 localStorage 中的預設順序）
    if (supabaseLoading) {
      setAllCountdowns(savedConfigs);
      return;
    }

    // 3. 合併：保留 localStorage 排序，用 Supabase 最新資料取代預設
    //    被刪除的預設自動移除，新增的預設自動補在最後
    const mergedConfigs = mergeCountdownConfigs(savedConfigs, gradeDefaults);

    // 4. 過濾停用的預設（停用狀態存在 separate key，維持順序以便重新啟用）
    const finalConfigs = mergedConfigs.filter(c => !c.isDefault || !disabledDefaultIds.has(c.id));

    // 5. 持久化合併後的完整列表（含停用預設，以保留順序）
    mergedConfigsRef.current = mergedConfigs;
    persistToStorage(mergedConfigs, storageKey);
    setAllCountdowns(finalConfigs);
  }, [settings.disableDefaultCountdowns, supabaseDefaults, storageKey, selectedGrade, disabledDefaultIds, gradeDefaults, supabaseLoading]);

  const persistToStorage = (countdowns: CountdownConfig[], key: string) => {
    if (countdowns.length > 0) {
      localStorage.setItem(key, JSON.stringify(countdowns.map(c => ({
        ...c,
        targetDate: c.targetDate.toISOString(),
        startDate: c.startDate?.toISOString()
      }))));
    } else {
      localStorage.removeItem(key);
    }
  };

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
    setCurrentIndex((prev) => (prev - 1 + allCountdowns.length) % allCountdowns.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % allCountdowns.length);
  };

  const validateForm = () => {
    if (!formData.label || !formData.targetDate) {
      toast({ title: "驗證失敗", description: "請填寫標題和目標日期", variant: "destructive" });
      return false;
    }

    const targetDateTime = parseTaiwanInput(formData.targetDate);
    if (targetDateTime <= getTaiwanNow()) {
      toast({ title: "驗證失敗", description: "目標時間必須晚於當前時間", variant: "destructive" });
      return false;
    }

    if (formData.startDate && parseTaiwanInput(formData.startDate) >= targetDateTime) {
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
      targetDate: parseTaiwanInput(formData.targetDate),
      startDate: formData.startDate ? parseTaiwanInput(formData.startDate) : undefined,
      progressLabel: formData.progressLabel || "進度",
      isDefault: false
    };

    const updated = [...allCountdowns, newConfig];
    setAllCountdowns(updated);
    if (storageKey) persistToStorage(updated, storageKey);
    setFormData({ label: "", targetDate: "", startDate: "", progressLabel: "" });
    setAddDialogOpen(false);
  };

  const formatDateForInput = (date: Date): string => {
    const d = new Date(date.getTime() + (8 * 60 * 60 * 1000)); // 轉換回 UTC+8 顯示在 input
    return d.toISOString().slice(0, 16);
  };

  const persistMergedList = (activeItems: CountdownConfig[]) => {
    if (!storageKey) return;
    const newMerged: CountdownConfig[] = [];
    const activeCopy = [...activeItems];
    for (const item of mergedConfigsRef.current) {
      if (item.isDefault && disabledDefaultIds.has(item.id)) {
        newMerged.push(item);
      } else {
        const next = activeCopy.shift();
        if (next) newMerged.push(next);
      }
    }
    newMerged.push(...activeCopy);
    mergedConfigsRef.current = newMerged;
    persistToStorage(newMerged, storageKey);
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

    const updated = allCountdowns.map(c => c.id === editingId ? {
      ...c,
      label: formData.label,
      targetDate: parseTaiwanInput(formData.targetDate),
      startDate: formData.startDate ? parseTaiwanInput(formData.startDate) : undefined,
      progressLabel: formData.progressLabel || "進度"
    } : c);

    setAllCountdowns(updated);
    persistMergedList(updated);
    setFormData({ label: "", targetDate: "", startDate: "", progressLabel: "" });
    setEditingId(null);
    setAddDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    const filtered = allCountdowns.filter(c => c.id !== id);
    setAllCountdowns(filtered);
    persistMergedList(filtered);

    if (currentIndex >= allCountdowns.length - 1) {
      setCurrentIndex(Math.max(0, allCountdowns.length - 2));
    }
  };

  const handleReorder = (newCountdowns: CountdownConfig[]) => {
    const currentId = allCountdowns[currentIndex]?.id;
    const newIndex = newCountdowns.findIndex(c => c.id === currentId);
    setAllCountdowns(newCountdowns);
    persistMergedList(newCountdowns);
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
    setAllCountdowns([]);
    setCurrentIndex(0);
    mergedConfigsRef.current = [];
    if (storageKey) localStorage.removeItem(storageKey);
    setManageDialogOpen(false);
    setResetDialogOpen(false);
    toast({ title: "重置成功", description: "已清除所有倒數計時" });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('zh-TW', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  const isComplete = progress >= 100;

  if (!selectedGrade) {
    return (
      <div className="relative overflow-hidden flex flex-col items-center justify-center gap-6 rounded-xl border bg-card px-6 py-12 shadow-sm">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/[0.12] blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-accent/[0.1] blur-3xl" />
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Clock className="h-6 w-6 text-primary" />
        </div>
        <div className="text-center">
          <h3 className="text-base font-bold text-muted-foreground">選擇年級</h3>
          <p className="mt-1 text-xs text-muted-foreground/50">請選擇你的班級年級以開始使用倒數計時器</p>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-2">
          {GRADES.map((grade) => (
            <button
              key={grade.id}
              onClick={() => handleGradeChange(grade.id)}
              className="rounded-xl border px-5 py-3 text-sm font-bold text-foreground transition-all hover:border-primary/30 hover:shadow-md active:scale-[0.98]"
            >
              {grade.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!currentConfig) {
    return (
      <div className="relative overflow-hidden flex flex-col items-center justify-center gap-5 rounded-xl border bg-card px-6 py-12 shadow-sm">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/[0.12] blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-accent/[0.1] blur-3xl" />
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Clock className="h-6 w-6 text-primary" />
        </div>
        <div className="text-center">
          <h3 className="text-base font-bold text-muted-foreground">尚無倒數計時</h3>
          <p className="mt-1 text-xs text-muted-foreground/50">點擊下方按鈕新增一個倒數計時</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => {
              setEditingId(null);
              setFormData({ label: "", targetDate: "", startDate: "", progressLabel: "" });
            }}>
              <Plus className="mr-1.5 h-4 w-4" />
              新增倒數計時
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">{editingId ? "編輯倒數計時" : "新增倒數計時"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="label-empty" className="text-xs font-semibold">標題</Label>
                <Input id="label-empty" value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })} placeholder="例如：寒假倒數" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetDate-empty" className="text-xs font-semibold">目標日期時間</Label>
                <Input id="targetDate-empty" type="datetime-local" value={formData.targetDate} onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })} />
                <p className="text-[10px] text-muted-foreground/60">必須晚於當前時間</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate-empty" className="text-xs font-semibold">開始日期時間（選填）</Label>
                <Input id="startDate-empty" type="datetime-local" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                <p className="text-[10px] text-muted-foreground/60">用於計算進度條，必須早於目標時間</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="progressLabel-empty" className="text-xs font-semibold">進度條標籤（選填）</Label>
                <Input id="progressLabel-empty" value={formData.progressLabel} onChange={(e) => setFormData({ ...formData, progressLabel: e.target.value })} placeholder="例如：學期進度" />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => { setAddDialogOpen(false); setEditingId(null); }}>取消</Button>
              <Button onClick={editingId ? handleSaveEdit : handleAddNew}>儲存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/[0.12] blur-3xl transition-colors" />
      <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-accent/[0.1] blur-3xl transition-colors" />
      <div className="relative flex flex-col gap-8 p-5 md:p-7">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {renderLabelWithEmoji(label)}
              </h2>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                倒數計時器
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => {
                  setEditingId(null);
                  setFormData({ label: "", targetDate: "", startDate: "", progressLabel: "" });
                }}>
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-background">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold">{editingId ? "編輯倒數計時" : "新增倒數計時"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="label" className="text-xs font-semibold">標題</Label>
                    <Input id="label" value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })} placeholder="例如：寒假倒數" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetDate" className="text-xs font-semibold">目標日期時間</Label>
                    <Input id="targetDate" type="datetime-local" value={formData.targetDate} onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })} />
                    <p className="text-[10px] text-muted-foreground/60">必須晚於當前時間</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-xs font-semibold">開始日期時間（選填）</Label>
                    <Input id="startDate" type="datetime-local" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                    <p className="text-[10px] text-muted-foreground/60">用於計算進度條，必須早於目標時間</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="progressLabel" className="text-xs font-semibold">進度條標籤（選填）</Label>
                    <Input id="progressLabel" value={formData.progressLabel} onChange={(e) => setFormData({ ...formData, progressLabel: e.target.value })} placeholder="例如：學期進度" />
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="ghost" onClick={() => { setAddDialogOpen(false); setEditingId(null); }}>取消</Button>
                  <Button onClick={editingId ? handleSaveEdit : handleAddNew}>儲存</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] w-[95vw] max-w-lg overflow-hidden flex flex-col p-0 bg-background">
                <DialogHeader className="p-5 pb-0">
                  <DialogTitle className="text-lg font-bold">管理倒數計時</DialogTitle>
                </DialogHeader>
                <div className="border-b border-border/40 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground/60">選擇年級：</span>
                    <div className="flex gap-1">
                      {GRADES.map(g => (
                        <button
                          key={g.id}
                          onClick={() => handleGradeChange(g.id)}
                          className={cn(
                            "rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                            selectedGrade === g.id
                              ? "bg-primary/15 text-primary shadow-sm"
                              : "text-muted-foreground/40 hover:text-muted-foreground/70 hover:bg-muted/30"
                          )}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-5">
                  <Reorder.Group
                    axis="y"
                    values={allCountdowns}
                    onReorder={handleReorder}
                    className="space-y-2"
                  >
                    {allCountdowns.map((countdown, index) => (
                      <Reorder.Item
                        key={countdown.id}
                        value={countdown}
                        className="group flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm"
                      >
                        <div className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground/40 group-hover:text-primary transition-colors">
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="mb-0.5 flex flex-wrap items-center gap-2 text-sm font-bold text-foreground">
                            <span className="truncate">{countdown.label}</span>
                            {countdown.isDefault && <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary font-bold">預設</span>}
                          </div>
                          <div className="text-[10px] text-muted-foreground/60 font-mono">
                            {formatDate(countdown.targetDate)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {countdown.isDefault ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-lg hover:bg-primary/10"
                              onClick={() => toggleDefaultDisabled(countdown.id)}
                              title="停用此預設倒數計時"
                            >
                              <EyeOff className="h-3.5 w-3.5 text-muted-foreground/70" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-lg hover:bg-primary/10"
                              onClick={() => handleEdit(countdown)}
                            >
                              <Edit className="h-3.5 w-3.5 text-muted-foreground/70" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg hover:bg-primary/10"
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground/70" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg hover:bg-primary/10"
                            onClick={() => handleMoveDown(index)}
                            disabled={index === allCountdowns.length - 1}
                          >
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/70" />
                          </Button>
                          {!countdown.isDefault && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-lg hover:bg-destructive/10 text-destructive/70 hover:text-destructive"
                              onClick={() => handleDelete(countdown.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>

                  {(() => {
                    const disabledDefaults = gradeDefaults.filter(c => disabledDefaultIds.has(c.id));
                    if (disabledDefaults.length === 0) return null;
                    return (
                      <div className="mt-5 space-y-2">
                        <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-wider px-1">已停用預設</p>
                        {disabledDefaults.map((countdown) => (
                          <div
                            key={countdown.id}
                            className="flex items-center gap-3 rounded-xl border border-dashed border-muted-foreground/20 bg-muted/20 p-3 opacity-60"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="mb-0.5 flex flex-wrap items-center gap-2 text-sm font-bold text-muted-foreground/60 line-through">
                                <span className="truncate">{countdown.label}</span>
                                <span className="shrink-0 rounded-full bg-muted-foreground/10 px-2 py-0.5 text-[10px] text-muted-foreground/50 font-bold">預設</span>
                              </div>
                              <div className="text-[10px] text-muted-foreground/40 font-mono">
                                {formatDate(countdown.targetDate)}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-lg hover:bg-primary/10"
                              onClick={() => toggleDefaultDisabled(countdown.id)}
                              title="啟用此預設倒數計時"
                            >
                              <Eye className="h-3.5 w-3.5 text-muted-foreground/50" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
                <div className="border-t border-border/40 bg-muted/10 p-4">
                  <DialogFooter className="flex-row items-center justify-between gap-4">
                    <Button variant="ghost" onClick={handleReset} className="text-xs font-semibold gap-2 text-muted-foreground hover:text-primary px-0">
                      <RotateCcw className="h-3.5 w-3.5" />重置為預設
                    </Button>
                    <Button onClick={() => setManageDialogOpen(false)}>完成</Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>

            <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-lg font-bold">確認重置</AlertDialogTitle>
                  <AlertDialogDescription className="text-sm">
                    確定要重置為預設倒數計時嗎？這將刪除所有自定義倒數計時。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmReset} className="bg-destructive hover:bg-destructive/90">確認重置</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex items-center gap-1 rounded-lg border border-border/30 bg-muted/30 px-1 py-0.5">
              <button onClick={handlePrevious} className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-colors">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[36px] text-center text-[11px] font-bold text-muted-foreground/80">
                {currentIndex + 1}<span className="text-muted-foreground/30 mx-px">/</span>{allCountdowns.length}
              </span>
              <button onClick={handleNext} className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-colors">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Timer body */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentConfig.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
          >
            {isComplete ? (
              <div className="flex flex-col items-center justify-center rounded-lg border bg-muted/20 py-12">
                <span className="mb-3 text-4xl">🎉</span>
                <h3 className="text-base font-bold text-foreground">目標時間已達成</h3>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {/* Number blocks */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "天", value: timeLeft?.days || 0 },
                    { label: "時", value: timeLeft?.hours || 0 },
                    { label: "分", value: timeLeft?.minutes || 0 },
                    { label: "秒", value: timeLeft?.seconds || 0 }
                  ].map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center justify-center rounded-lg border bg-muted/20 py-5">
                      <span className="font-mono text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                        {(item.value).toString().padStart(2, '0')}
                      </span>
                      <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Progress */}
                <div className="rounded-lg border bg-muted/20 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">進度條</span>
                    <span className="text-[10px] font-semibold text-muted-foreground">已完成</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-base font-bold text-foreground">{progressLabel}</p>
                    <span className="text-sm font-bold text-primary">{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="mt-3 h-2 w-full rounded-full" gradient />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
