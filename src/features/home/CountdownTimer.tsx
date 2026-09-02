import { useEffect, useMemo, useRef, useState } from "react";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Settings,
  Edit,
  RotateCcw,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";
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
import { useSettings } from "@/hooks/settings-context";
import { useToast } from "@/components/ui/toast";
import { useSiteCountdowns } from "@/hooks/use-site-countdowns";
import { Reorder, AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

/* 年級切換（單一品牌色） */
const GRADES = [
  { id: "7", label: "七年級" },
  { id: "8", label: "八年級" },
  { id: "9", label: "九年級" },
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

/* ===== 台灣時間輔助 ===== */

// 取得當前台灣時間
const getTaiwanNow = () => {
  const now = new Date();
  return new Date(now.getTime() + now.getTimezoneOffset() * 60000 + 8 * 60 * 60 * 1000);
};

// 將 datetime-local input 字串（視為台灣時間）轉為 Date
const parseTaiwanInput = (inputStr: string): Date => {
  return new Date(inputStr + "+08:00");
};

// 轉換回 UTC+8 顯示在 datetime-local input
const formatDateForInput = (date: Date): string => {
  const d = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 16);
};

const formatDate = (date: Date) => {
  return date.toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* ===== Emoji 原色顯示 ===== */
const EMOJI_REGEX =
  /(\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]|\ud83e[\udd00-\uddff]|\ud83f[\udc00-\udfff]|[\u2600-\u26FF]|[\u2700-\u27BF]|\u00a9|\u00ae)/;

const renderLabelWithEmoji = (text: string) => {
  const parts = text.split(EMOJI_REGEX);
  return parts.map((part, index) => {
    if (part && EMOJI_REGEX.test(part)) {
      return (
        <span
          key={index}
          className="inline-block -translate-y-px align-middle"
          style={{
            display: "inline-block",
            opacity: 1,
            color: "initial",
            background: "none",
            WebkitBackgroundClip: "initial",
            WebkitTextFillColor: "initial",
            fontFamily:
              '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "Android Emoji", "EmojiSymbols", sans-serif',
            verticalAlign: "middle",
          }}
        >
          {part}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

/* ===== Supabase 預設合併 ===== */
const mergeCountdownConfigs = (
  savedConfigs: CountdownConfig[],
  freshDefaults: CountdownConfig[]
): CountdownConfig[] => {
  const defaultMap = new Map(freshDefaults.map((item) => [item.id, item]));

  const mergedConfigs = savedConfigs
    .map((item) => {
      if (!item.isDefault) return item;
      return defaultMap.get(item.id);
    })
    .filter(Boolean) as CountdownConfig[];

  const existingIds = new Set(mergedConfigs.map((item) => item.id));
  const missingDefaults = freshDefaults.filter((item) => !existingIds.has(item.id));
  return [...mergedConfigs, ...missingDefaults];
};

/* ===== localStorage keys ===== */
const CUSTOM_STORAGE_PREFIX = "cmjh-custom-countdowns";
const GRADE_STORAGE_KEY = "cmjh-countdown-grade";
const DISABLED_STORAGE_KEY = "cmjh-disabled-defaults";

const getStorageKey = (grade: GradeId) => `${CUSTOM_STORAGE_PREFIX}-${grade}`;

const parseStoredCountdowns = (raw: string | null): CountdownConfig[] => {
  if (!raw) return [];
  try {
    return JSON.parse(raw).map((c: Record<string, unknown>) => ({
      ...c,
      targetDate: new Date(c.targetDate as string),
      startDate: c.startDate ? new Date(c.startDate as string) : undefined,
    }));
  } catch (e) {
    console.error("Local storage parse error:", e);
    return [];
  }
};

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

const EMPTY_FORM = { label: "", targetDate: "", startDate: "", progressLabel: "" };

/* ===== 卡片外框共用 ===== */
const CardGlow = () => (
  <>
    <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/[0.12] blur-3xl" />
    <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-primary/[0.06] blur-3xl" />
  </>
);

/* ===== 新增／編輯表單 Dialog ===== */
const CountdownFormDialog = ({
  editingId,
  formData,
  setFormData,
  onClose,
  onSubmit,
}: {
  editingId: string | null;
  formData: typeof EMPTY_FORM;
  setFormData: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
  onClose: () => void;
  onSubmit: () => void;
}) => (
  <DialogContent className="rounded-2xl bg-background">
    <DialogHeader>
      <DialogTitle className="text-lg font-bold">{editingId ? "編輯倒數計時" : "新增倒數計時"}</DialogTitle>
    </DialogHeader>
    <div className="space-y-4 py-4">
      {(["label", "targetDate", "startDate", "progressLabel"] as const).map((field) => (
        <div key={field} className="space-y-2">
          <Label htmlFor={field} className="text-xs font-semibold">
            {field === "label"
              ? "標題"
              : field === "targetDate"
                ? "目標日期時間"
                : field === "startDate"
                  ? "開始日期時間（選填）"
                  : "進度條標籤（選填）"}
          </Label>
          {field === "targetDate" || field === "startDate" ? (
            <>
              <Input
                id={field}
                type="datetime-local"
                value={formData[field]}
                onChange={(e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }))}
              />
              <p className="text-[10px] text-muted-foreground/60">
                {field === "targetDate" ? "必須晚於當前時間" : "用於計算進度條，必須早於目標時間"}
              </p>
            </>
          ) : (
            <Input
              id={field}
              value={formData[field]}
              onChange={(e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }))}
              placeholder={field === "label" ? "例如：寒假倒數" : "例如：學期進度"}
            />
          )}
        </div>
      ))}
    </div>
    <DialogFooter className="gap-2">
      <Button variant="ghost" onClick={onClose}>
        取消
      </Button>
      <Button onClick={onSubmit}>儲存</Button>
    </DialogFooter>
  </DialogContent>
);

/* ===== 管理面板主體 ===== */
const ManagePanel = ({
  allCountdowns,
  gradeDefaults,
  disabledDefaultIds,
  selectedGrade,
  onGradeChange,
  onReorder,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
  onToggleDefaultDisabled,
  onReset,
  onClose,
}: {
  allCountdowns: CountdownConfig[];
  gradeDefaults: CountdownConfig[];
  disabledDefaultIds: Set<string>;
  selectedGrade: GradeId;
  onGradeChange: (grade: GradeId) => void;
  onReorder: (items: CountdownConfig[]) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onEdit: (countdown: CountdownConfig) => void;
  onDelete: (id: string) => void;
  onToggleDefaultDisabled: (id: string) => void;
  onReset: () => void;
  onClose: () => void;
}) => {
  const disabledDefaults = gradeDefaults.filter((c) => disabledDefaultIds.has(c.id));

  return (
    <>
      <div className="border-b border-border/40 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground/60">選擇年級：</span>
          <div className="flex gap-1">
            {GRADES.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => onGradeChange(g.id)}
                className={cn(
                  "cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                  selectedGrade === g.id
                    ? "bg-primary/15 text-primary shadow-sm"
                    : "text-muted-foreground/40 hover:bg-muted/30 hover:text-muted-foreground/70"
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <Reorder.Group axis="y" values={allCountdowns} onReorder={onReorder} className="space-y-2">
          {allCountdowns.map((countdown, index) => (
            <Reorder.Item
              key={countdown.id}
              value={countdown}
              className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3 shadow-sm"
            >
              <div className="cursor-grab p-1 text-muted-foreground/40 transition-colors group-hover:text-primary active:cursor-grabbing">
                <GripVertical className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex flex-wrap items-center gap-2 text-sm font-bold text-foreground">
                  <span className="truncate">{countdown.label}</span>
                  {countdown.isDefault && (
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      預設
                    </span>
                  )}
                </div>
                <div className="font-mono text-[10px] text-muted-foreground/60">{formatDate(countdown.targetDate)}</div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {countdown.isDefault ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg hover:bg-primary/10"
                    onClick={() => onToggleDefaultDisabled(countdown.id)}
                    title="停用此預設倒數計時"
                  >
                    <EyeOff className="h-3.5 w-3.5 text-muted-foreground/70" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg hover:bg-primary/10"
                    onClick={() => onEdit(countdown)}
                  >
                    <Edit className="h-3.5 w-3.5 text-muted-foreground/70" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg hover:bg-primary/10"
                  onClick={() => onMoveUp(index)}
                  disabled={index === 0}
                >
                  <ChevronUp className="h-3.5 w-3.5 text-muted-foreground/70" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg hover:bg-primary/10"
                  onClick={() => onMoveDown(index)}
                  disabled={index === allCountdowns.length - 1}
                >
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/70" />
                </Button>
                {!countdown.isDefault && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onDelete(countdown.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        {disabledDefaults.length > 0 && (
          <div className="mt-5 space-y-2">
            <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40">已停用預設</p>
            {disabledDefaults.map((countdown) => (
              <div
                key={countdown.id}
                className="flex items-center gap-3 rounded-xl border border-dashed border-muted-foreground/20 bg-muted/20 p-3 opacity-60"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex flex-wrap items-center gap-2 text-sm font-bold text-muted-foreground/60 line-through">
                    <span className="truncate">{countdown.label}</span>
                    <span className="shrink-0 rounded-full bg-muted-foreground/10 px-2 py-0.5 text-[10px] font-bold text-muted-foreground/50">
                      預設
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground/40">{formatDate(countdown.targetDate)}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg hover:bg-primary/10"
                  onClick={() => onToggleDefaultDisabled(countdown.id)}
                  title="啟用此預設倒數計時"
                >
                  <Eye className="h-3.5 w-3.5 text-muted-foreground/50" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border/40 bg-muted/10 p-4">
        <DialogFooter className="flex-row items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={onReset}
            className="gap-2 px-0 text-xs font-semibold text-muted-foreground hover:text-primary"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            重置為預設
          </Button>
          <Button onClick={onClose}>完成</Button>
        </DialogFooter>
      </div>
    </>
  );
};

/* ===== 主元件 ===== */
export function CountdownTimer() {
  const { toast } = useToast();
  const { settings } = useSettings();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(
    null,
  );
  const [progress, setProgress] = useState(0);
  const [allCountdowns, setAllCountdowns] = useState<CountdownConfig[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

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

  const { countdowns: supabaseDefaults, isLoading: supabaseLoading } = useSiteCountdowns();

  // 保留合併後的完整列表（含停用預設），供年級切換時持久化
  const mergedConfigsRef = useRef<CountdownConfig[]>([]);

  const persistToStorage = (countdowns: CountdownConfig[], key: string) => {
    if (countdowns.length > 0) {
      localStorage.setItem(
        key,
        JSON.stringify(
          countdowns.map((c) => ({
            ...c,
            targetDate: c.targetDate.toISOString(),
            startDate: c.startDate?.toISOString(),
          })),
        ),
      );
    } else {
      localStorage.removeItem(key);
    }
  };

  // 合併後的完整列表（含被停用的預設，以保留順序）
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

  const handleGradeChange = (grade: GradeId) => {
    // 1. 讀取目標年級的現有資料
    const targetKey = getStorageKey(grade);
    const targetData = parseStoredCountdowns(localStorage.getItem(targetKey));

    // 2. 從當前年級取出自訂項目，附加到目標年級
    const currentCustoms = allCountdowns.filter((c) => !c.isDefault);
    targetData.push(...currentCustoms);

    // 3. 儲存至目標年級
    persistToStorage(targetData, targetKey);

    // 4. 清空當前年級的自訂項目（只留預設）
    if (storageKey) {
      const currentDefaults = mergedConfigsRef.current.filter((c) => c.isDefault);
      persistToStorage(currentDefaults, storageKey);
      mergedConfigsRef.current = currentDefaults;
    }

    // 5. 切換年級
    localStorage.setItem(GRADE_STORAGE_KEY, grade);
    setSelectedGrade(grade);
    setCurrentIndex(0);
    setFormData(EMPTY_FORM);
  };

  const gradeDefaults = useMemo<CountdownConfig[]>(
    () =>
      (supabaseDefaults || [])
        .filter((c) => !c.grade || c.grade === selectedGrade)
        .map((c) => ({
          id: c.id,
          targetDate: new Date(c.target_date),
          startDate: c.start_date ? new Date(c.start_date) : undefined,
          label: c.label,
          progressLabel: c.progress_label,
          isDefault: true,
        })),
    [supabaseDefaults, selectedGrade],
  );

  // 載入倒數計時（合併 localStorage 順序 + Supabase 最新資料）
  useEffect(() => {
    if (!storageKey) return;
    const savedConfigs = parseStoredCountdowns(localStorage.getItem(storageKey));

    // 如果停用預設倒數計時，只載入自訂項目
    if (settings.disableDefaultCountdowns) {
      const customOnly = savedConfigs.filter((c) => !c.isDefault);
      persistToStorage(customOnly, storageKey);
      setAllCountdowns(customOnly);
      return;
    }

    // 如果 Supabase 資料還沒載入，不要合併或持久化（避免清掉 localStorage 中的預設順序）
    if (supabaseLoading) {
      setAllCountdowns(savedConfigs);
      return;
    }

    // 合併：保留 localStorage 排序，用 Supabase 最新資料取代預設
    // 被刪除的預設自動移除，新增的預設自動補在最後
    const mergedConfigs = mergeCountdownConfigs(savedConfigs, gradeDefaults);

    // 過濾停用的預設（停用狀態存在 separate key，維持順序以便重新啟用）
    const finalConfigs = mergedConfigs.filter((c) => !c.isDefault || !disabledDefaultIds.has(c.id));

    // 持久化合併後的完整列表（含停用預設，以保留順序）
    mergedConfigsRef.current = mergedConfigs;
    persistToStorage(mergedConfigs, storageKey);
    setAllCountdowns(finalConfigs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    settings.disableDefaultCountdowns,
    supabaseDefaults,
    storageKey,
    selectedGrade,
    disabledDefaultIds,
    gradeDefaults,
    supabaseLoading,
  ]);

  const currentConfig = allCountdowns[currentIndex];
  const { targetDate, startDate, label, progressLabel } = currentConfig || {};

  // 每秒更新倒數與進度
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
      const start = startDate ? startDate.getTime() : taiwanNow.getTime() - 7 * 24 * 60 * 60 * 1000;
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

  const openAddDialog = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  const handleAddNew = () => {
    if (!validateForm()) return;

    const newConfig: CountdownConfig = {
      id: `custom-${Date.now()}`,
      label: formData.label,
      targetDate: parseTaiwanInput(formData.targetDate),
      startDate: formData.startDate ? parseTaiwanInput(formData.startDate) : undefined,
      progressLabel: formData.progressLabel || "進度",
      isDefault: false,
    };

    const updated = [...allCountdowns, newConfig];
    setAllCountdowns(updated);
    if (storageKey) persistToStorage(updated, storageKey);
    setFormData(EMPTY_FORM);
    setAddDialogOpen(false);
  };

  const handleEdit = (countdown: CountdownConfig) => {
    setEditingId(countdown.id);
    setFormData({
      label: countdown.label,
      targetDate: formatDateForInput(countdown.targetDate),
      startDate: countdown.startDate ? formatDateForInput(countdown.startDate) : "",
      progressLabel: countdown.progressLabel,
    });
    setAddDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!validateForm()) return;

    const updated = allCountdowns.map((c) =>
      c.id === editingId
        ? {
            ...c,
            label: formData.label,
            targetDate: parseTaiwanInput(formData.targetDate),
            startDate: formData.startDate ? parseTaiwanInput(formData.startDate) : undefined,
            progressLabel: formData.progressLabel || "進度",
          }
        : c,
    );

    setAllCountdowns(updated);
    persistMergedList(updated);
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setAddDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    const filtered = allCountdowns.filter((c) => c.id !== id);
    const deletedIndex = allCountdowns.findIndex((c) => c.id === id);
    setAllCountdowns(filtered);
    persistMergedList(filtered);

    if (deletedIndex < currentIndex) {
      setCurrentIndex(currentIndex - 1);
    } else if (currentIndex >= filtered.length) {
      setCurrentIndex(Math.max(0, filtered.length - 1));
    }
  };

  const handleReorder = (newCountdowns: CountdownConfig[]) => {
    const currentId = allCountdowns[currentIndex]?.id;
    const newIndex = newCountdowns.findIndex((c) => c.id === currentId);
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

  const confirmReset = () => {
    setAllCountdowns([]);
    setCurrentIndex(0);
    mergedConfigsRef.current = [];
    if (storageKey) localStorage.removeItem(storageKey);
    setManageDialogOpen(false);
    setResetDialogOpen(false);
    toast({ title: "重置成功", description: "已清除所有倒數計時" });
  };

  const isComplete = progress >= 100;
  const closeFormDialog = () => {
    setAddDialogOpen(false);
    setEditingId(null);
  };

  /* --- 尚未選擇年級 --- */
  if (!selectedGrade) {
    return (
      <div className="relative flex flex-col items-center justify-center gap-6 overflow-hidden rounded-xl border border-border/60 bg-card px-6 py-12 shadow-sm">
        <CardGlow />
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
              type="button"
              onClick={() => handleGradeChange(grade.id)}
              className="rounded-xl border border-border/60 px-5 py-3 text-sm font-bold text-foreground transition-all hover:border-primary/30 hover:shadow-md active:scale-[0.98]"
            >
              {grade.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* --- 沒有任何倒數項目 --- */
  if (!currentConfig) {
    return (
      <div className="relative flex flex-col items-center justify-center gap-5 overflow-hidden rounded-xl border border-border/60 bg-card px-6 py-12 shadow-sm">
        <CardGlow />
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Clock className="h-6 w-6 text-primary" />
        </div>
        <div className="text-center">
          <h3 className="text-base font-bold text-muted-foreground">尚無倒數計時</h3>
          <p className="mt-1 text-xs text-muted-foreground/50">點擊下方按鈕新增一個倒數計時</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openAddDialog}>
              <Plus className="mr-1.5 h-4 w-4" />
              新增倒數計時
            </Button>
          </DialogTrigger>
          <CountdownFormDialog
            editingId={editingId}
            formData={formData}
            setFormData={setFormData}
            onClose={closeFormDialog}
            onSubmit={handleAddNew}
          />
        </Dialog>
      </div>
    );
  }

  /* --- 主要顯示 --- */
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      <CardGlow />
      <div className="relative flex flex-col gap-8 p-5 md:p-7">
        {/* 標題與操作 */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{renderLabelWithEmoji(label)}</h2>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">倒數計時器</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 新增 */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={openAddDialog}>
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <CountdownFormDialog
                editingId={editingId}
                formData={formData}
                setFormData={setFormData}
                onClose={closeFormDialog}
                onSubmit={editingId ? handleSaveEdit : handleAddNew}
              />
            </Dialog>

            {/* 管理 */}
            <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="flex max-h-[85vh] w-[95vw] max-w-lg flex-col overflow-hidden rounded-2xl bg-background p-0">
                <DialogHeader className="p-5 pb-0">
                  <DialogTitle className="text-lg font-bold">管理倒數計時</DialogTitle>
                </DialogHeader>
                <ManagePanel
                  allCountdowns={allCountdowns}
                  gradeDefaults={gradeDefaults}
                  disabledDefaultIds={disabledDefaultIds}
                  selectedGrade={selectedGrade}
                  onGradeChange={handleGradeChange}
                  onReorder={handleReorder}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleDefaultDisabled={toggleDefaultDisabled}
                  onReset={() => setResetDialogOpen(true)}
                  onClose={() => setManageDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>

            {/* 重置確認 */}
            <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-lg font-bold">確認重置</AlertDialogTitle>
                  <AlertDialogDescription className="text-sm">
                    確定要重置為預設倒數計時嗎？這將刪除所有自定義倒數計時。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={confirmReset}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    確認重置
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* 上一個／下一個 */}
            <div className="flex items-center gap-1 rounded-lg border border-border/30 bg-muted/30 px-1 py-0.5">
              <button
                type="button"
                onClick={handlePrevious}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-muted/50 hover:text-foreground"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[36px] text-center text-[11px] font-bold text-muted-foreground/80">
                {currentIndex + 1}
                <span className="mx-px text-muted-foreground/30">/</span>
                {allCountdowns.length}
              </span>
              <button
                type="button"
                onClick={handleNext}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-muted/50 hover:text-foreground"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 倒數本體（切換項目時淡入淡出） */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentConfig.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
          >
            {isComplete ? (
              /* 目標達成 */
              <div className="flex flex-col items-center justify-center rounded-lg border border-border/60 bg-muted/20 py-12">
                <span className="mb-3 text-4xl">🎉</span>
                <h3 className="text-base font-bold text-foreground">目標時間已達成</h3>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {/* 數字區塊 */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "天", value: timeLeft?.days || 0 },
                    { label: "時", value: timeLeft?.hours || 0 },
                    { label: "分", value: timeLeft?.minutes || 0 },
                    { label: "秒", value: timeLeft?.seconds || 0 },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center justify-center rounded-lg border border-border/60 bg-muted/20 py-5"
                    >
                      <span className="font-mono text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                        {(item.value || 0).toString().padStart(2, "0")}
                      </span>
                      <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* 進度條 */}
                <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">進度條</span>
                    <span className="text-[10px] font-semibold text-muted-foreground">已完成</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-base font-bold text-foreground">{progressLabel}</p>
                    <span className="text-sm font-bold text-primary">{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="mt-3 h-2 w-full rounded-full" />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
