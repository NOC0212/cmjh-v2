/** 網站管理後台 */
import { useState, useEffect } from "react";
import {
  Shield,
  Lock,
  LogIn,
  Clock,
  Megaphone,
  HardDrive,
  Wrench,
  Plus,
  Trash2,
  Edit,
  Save,
  ChevronLeft,
  Eye,
  EyeOff,
  TrendingUp,
  Users,
  CalendarDays,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useSiteCountdowns, type SiteCountdown } from "@/hooks/use-site-countdowns";
import { useSiteAnnouncements, type SiteAnnouncement } from "@/hooks/use-site-announcements";
import {
  useSiteConfig,
  isAdminAuthenticated,
  verifyAdminPassword,
  hasAdminPassword,
  setStoredPassword,
} from "@/hooks/use-site-config";
import { supabase, SUPABASE_ENABLED } from "@/lib/supabase";
import { useVisitStats, type DailyVisit } from "@/hooks/use-visit-stats";
import { sha256 } from "@/lib/crypto";
import { isMaintenanceWhitelisted, setMaintenanceWhitelist } from "@/lib/app-version";

type AdminSection =
  | "countdowns"
  | "announcements"
  | "maintenance"
  | "appversion"
  | "password"
  | "visitstats"
  | null;

interface EditingCountdown {
  id?: string;
  label: string;
  target_date: string;
  start_date: string;
  progress_label: string;
  grade: string;
}

interface EditingAnnouncement {
  id?: string;
  title: string;
  date: string;
  type: string;
  pinned: boolean;
  content: string;
  image_url: string;
}

const COUNTDOWN_GRADES = [
  { value: "all", label: "全部年級" },
  { value: "7", label: "七年級" },
  { value: "8", label: "八年級" },
  { value: "9", label: "九年級" },
];

const TZ_TAIPEI = "Asia/Taipei";

const utcToTaiwanInputStr = (isoStr: string): string => {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  return new Date(d.getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 16);
};

const taiwanInputToUtc = (inputStr: string): string => {
  if (!inputStr) return "";
  const d = new Date(inputStr + "+08:00");
  return d.toISOString();
};

// ─── 就地 CRUD state（取代已移除的 useCrudManager） ──────────────────────────

function useCrud<
  T extends { id: string; sort_order?: number | null },
  E extends { id?: string },
>(source: T[], buildItem: (editing: E, items: T[]) => T) {
  const [items, setItems] = useState<T[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<E | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (source.length > 0) {
      setItems([...source]);
    }
  }, [source]);

  const handleAdd = (template: E) => {
    setEditing(template);
    setDialogOpen(true);
  };

  const handleEdit = (item: T, transform: (item: T) => E) => {
    setEditing(transform(item));
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editing) return;
    const newItem = buildItem(editing, items);
    if (editing.id && items.some((i) => i.id === editing.id)) {
      setItems((prev) => prev.map((i) => (i.id === editing.id ? newItem : i)));
    } else {
      setItems((prev) => [...prev, newItem]);
    }
    setDialogOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setDeleteConfirmId(null);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    setItems((prev) => {
      const newList = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newList.length) return prev;
      [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];
      return newList.map((item, i) => ({ ...item, sort_order: i }));
    });
  };

  const changed = JSON.stringify(items) !== JSON.stringify(source);

  return {
    items,
    dialogOpen,
    setDialogOpen,
    editing,
    setEditing,
    deleteConfirmId,
    setDeleteConfirmId,
    changed,
    handleAdd,
    handleEdit,
    handleSave,
    handleDelete,
    handleMove,
  };
}

// ─── 手寫 SVG 柱狀圖（取代 recharts，品牌色） ────────────────────────────────

function VisitBarChart({ data }: { data: DailyVisit[] }) {
  const W = 640;
  const H = 220;
  const PAD = { top: 12, right: 12, bottom: 26, left: 38 };
  const iw = W - PAD.left - PAD.right;
  const ih = H - PAD.top - PAD.bottom;
  const n = data.length;
  const maxCount = Math.max(1, ...data.map((d) => d.count));
  const yMax = Math.max(4, Math.ceil(maxCount / 4) * 4);
  const slot = iw / n;
  const barW = Math.min(slot * 0.6, 18);
  const labelStep = Math.max(1, Math.ceil(n / 7));
  const ticks = [0, yMax / 2, yMax];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-48 w-full"
      role="img"
      aria-label="每日訪問次數柱狀圖"
    >
      {ticks.map((t) => {
        const y = PAD.top + ih - (t / yMax) * ih;
        return (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y}
              y2={y}
              stroke="hsl(var(--border))"
              strokeDasharray="3 3"
              strokeOpacity={0.6}
            />
            <text
              x={PAD.left - 6}
              y={y + 3.5}
              textAnchor="end"
              fontSize={10}
              fill="hsl(var(--muted-foreground))"
            >
              {t}
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const h = d.count > 0 ? Math.max((d.count / yMax) * ih, 2) : 0;
        const x = PAD.left + i * slot + (slot - barW) / 2;
        const y = PAD.top + ih - h;
        const showLabel = i % labelStep === 0 || i === n - 1;
        const dt = new Date(d.date + "T00:00:00");
        return (
          <g key={d.date}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={Math.min(3, barW / 2)}
              fill="hsl(var(--primary) / 0.2)"
              stroke="hsl(var(--primary))"
              strokeOpacity={0.5}
              strokeWidth={1}
            >
              <title>{`${d.date}：${d.count.toLocaleString()} 次`}</title>
            </rect>
            {showLabel && (
              <text
                x={PAD.left + i * slot + slot / 2}
                y={H - 8}
                textAnchor="middle"
                fontSize={10}
                fill="hsl(var(--muted-foreground))"
              >
                {dt.getMonth() + 1}/{dt.getDate()}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── 主頁面 ──────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { toast } = useToast();
  const { countdowns, updateCountdowns, isUpdating: cdUpdating } = useSiteCountdowns();
  const { announcements, updateAnnouncements, isUpdating: annUpdating } = useSiteAnnouncements();
  const { maintenance, appVersion, updateConfig, isUpdatingConfig } = useSiteConfig();
  const [selectedRange, setSelectedRange] = useState<number>(30);
  const { stats: visitStats, dailyVisits, isLoading: statsLoading } = useVisitStats(selectedRange);

  const [authenticated, setAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [isPasswordSet, setIsPasswordSet] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeSection, setActiveSection] = useState<AdminSection>(null);
  const [passwordMode, setPasswordMode] = useState<"login" | "setup">("login");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [cdGradeFilter, setCdGradeFilter] = useState<string>("all");

  const cdMgr = useCrud<SiteCountdown, EditingCountdown>(countdowns, (editing, items): SiteCountdown => ({
    id: editing.id || `admin-cd-${Date.now()}`,
    label: editing.label,
    target_date: taiwanInputToUtc(editing.target_date),
    start_date: editing.start_date ? taiwanInputToUtc(editing.start_date) : null,
    progress_label: editing.progress_label || "進度",
    sort_order: editing.id
      ? items.find((c) => c.id === editing.id)?.sort_order ?? items.length
      : items.length,
    active: true,
    grade: editing.grade === "all" ? null : editing.grade,
  }));

  const annMgr = useCrud<SiteAnnouncement, EditingAnnouncement>(announcements, (editing, items): SiteAnnouncement => ({
    id: editing.id || `admin-ann-${Date.now()}`,
    title: editing.title,
    date: editing.date,
    type: editing.type,
    pinned: editing.pinned,
    content: editing.content || "",
    image_url: editing.image_url || undefined,
    sort_order: editing.id
      ? items.find((a) => a.id === editing.id)?.sort_order ?? items.length
      : items.length,
    active: true,
  }));

  const [localMaintenance, setLocalMaintenance] = useState({
    isMaintenance: false,
    showTimer: true,
    maintenanceEndTime: "",
    title: "",
    message: "",
  });
  const [whitelistEnabled, setWhitelistEnabled] = useState(() => isMaintenanceWhitelisted());

  const [localVersion, setLocalVersion] = useState("");
  const [localHighlights, setLocalHighlights] = useState<string[]>([]);

  useEffect(() => {
    if (maintenance) {
      setLocalMaintenance({
        isMaintenance: maintenance.isMaintenance,
        showTimer: maintenance.showTimer,
        maintenanceEndTime: maintenance.maintenanceEndTime || "",
        title: maintenance.title || "",
        message: maintenance.message || "",
      });
    }
  }, [maintenance]);

  useEffect(() => {
    if (appVersion) {
      setLocalVersion(appVersion.latestVersion || "");
      setLocalHighlights(appVersion.releaseHighlights || []);
    }
  }, [appVersion]);

  useEffect(() => {
    if (isAdminAuthenticated()) {
      setAuthenticated(true);
    }
    hasAdminPassword().then((has) => {
      setIsPasswordSet(has);
      if (!has) {
        setPasswordMode("setup");
      }
    });
  }, []);

  const handleLogin = async () => {
    if (!passwordInput) {
      toast({ title: "請輸入密碼", variant: "destructive" });
      return;
    }
    setIsVerifying(true);
    const valid = await verifyAdminPassword(passwordInput);
    setIsVerifying(false);

    if (valid) {
      setStoredPassword(await sha256(passwordInput));
      setAuthenticated(true);
      toast({ title: "驗證成功", description: "歡迎進入管理後台", variant: "success" });
    } else {
      toast({ title: "密碼錯誤", variant: "destructive" });
    }
  };

  const handleSetupPassword = async () => {
    if (!newPassword || newPassword.length < 4) {
      toast({ title: "密碼至少需要4個字元", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "兩次輸入的密碼不一致", variant: "destructive" });
      return;
    }

    setIsVerifying(true);
    try {
      await updateConfig({ newPassword: newPassword });
      setAuthenticated(true);
      setIsPasswordSet(true);
      toast({ title: "密碼設定成功", description: "請妥善保管您的密碼", variant: "success" });
    } catch (err) {
      toast({ title: "設定失敗", description: String(err), variant: "destructive" });
    }
    setIsVerifying(false);
  };

  const handleSaveCountdown = () => {
    if (!cdMgr.editing?.label || !cdMgr.editing?.target_date) {
      toast({ title: "請填寫標題和目標日期", variant: "destructive" });
      return;
    }
    cdMgr.handleSave();
  };

  const handleSaveCountdowns = async () => {
    try {
      await updateCountdowns(cdMgr.items);
      toast({ title: "儲存成功", description: "預設倒數計時已更新", variant: "success" });
    } catch (err) {
      toast({ title: "儲存失敗", description: String(err), variant: "destructive" });
    }
  };

  const handleUploadImage = async (file: File) => {
    if (!SUPABASE_ENABLED) {
      toast({ title: "上傳失敗", description: "請先設定 Supabase 環境變數", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "圖片過大", description: "請選擇 5MB 以下的圖片", variant: "destructive" });
      return;
    }
    if (!["image/png", "image/jpeg", "image/gif", "image/webp"].includes(file.type)) {
      toast({ title: "格式不支援", description: "僅支援 PNG、JPEG、GIF、WebP", variant: "destructive" });
      return;
    }
    try {
      const oldUrl = annMgr.editing?.image_url;
      if (oldUrl) {
        const BUCKET_PATH = "/announcement-images/";
        const idx = oldUrl.lastIndexOf(BUCKET_PATH);
        if (idx !== -1) {
          const oldFileName = oldUrl.slice(idx + BUCKET_PATH.length);
          if (oldFileName) {
            await supabase.storage.from("announcement-images").remove([oldFileName]);
          }
        }
      }

      const ext = file.name.split(".").pop() || "png";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("announcement-images")
        .upload(fileName, file, { cacheControl: "31536000" });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage
        .from("announcement-images")
        .getPublicUrl(fileName);
      annMgr.setEditing((prev) => (prev ? { ...prev, image_url: urlData.publicUrl } : null));
      toast({ title: "上傳成功", variant: "success" });
    } catch (err) {
      toast({ title: "上傳失敗", description: String(err), variant: "destructive" });
    }
  };

  const handleSaveAnnouncement = () => {
    if (!annMgr.editing?.title || !annMgr.editing?.date) {
      toast({ title: "請填寫標題和日期", variant: "destructive" });
      return;
    }
    annMgr.handleSave();
  };

  const handleSaveAnnouncements = async () => {
    try {
      await updateAnnouncements(annMgr.items);
      toast({ title: "儲存成功", description: "本站公告已更新", variant: "success" });
    } catch (err) {
      toast({ title: "儲存失敗", description: String(err), variant: "destructive" });
    }
  };

  const handleSaveMaintenance = async () => {
    try {
      await updateConfig({ maintenance: localMaintenance });
      toast({ title: "儲存成功", description: "維護設定已更新", variant: "success" });
    } catch (err) {
      toast({ title: "儲存失敗", description: String(err), variant: "destructive" });
    }
  };

  const handleSaveAppVersion = async () => {
    try {
      await updateConfig({
        appVersion: { latestVersion: localVersion, releaseHighlights: localHighlights },
      });
      toast({ title: "儲存成功", description: "版本資訊已更新", variant: "success" });
    } catch (err) {
      toast({ title: "儲存失敗", description: String(err), variant: "destructive" });
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 4) {
      toast({ title: "密碼至少需要4個字元", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "兩次輸入的密碼不一致", variant: "destructive" });
      return;
    }
    try {
      await updateConfig({ newPassword: newPassword });
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMode("login");
      toast({ title: "密碼變更成功", variant: "success" });
    } catch (err) {
      toast({ title: "變更失敗", description: String(err), variant: "destructive" });
    }
  };

  const maintenanceSource = maintenance ? (SUPABASE_ENABLED ? "Supabase" : "JSON 備份") : "無資料";

  if (!SUPABASE_ENABLED || isPasswordSet === null) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
        <div className="mb-6 rounded-2xl bg-muted p-5">
          <Shield className="h-10 w-10 text-muted-foreground/40" />
        </div>
        <h3 className="text-lg font-bold text-muted-foreground">管理後台暫不可用</h3>
        {!SUPABASE_ENABLED ? (
          <p className="mt-2 text-sm text-muted-foreground/60 max-w-sm">
            請先在 .env 檔案中設定 VITE_SUPABASE_URL 及 VITE_SUPABASE_ANON_KEY，
            並在 Supabase SQL Editor 執行 supabase-setup-complete.sql 腳本。
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground/60">正在檢查設定...</p>
        )}
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-md py-8">
        <div
          className="rounded-xl border border-border/50 bg-card p-8 shadow-sm animate-fade-in"
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              {passwordMode === "setup" ? (
                <Lock className="h-7 w-7 text-primary" />
              ) : (
                <Shield className="h-7 w-7 text-primary" />
              )}
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {passwordMode === "setup" ? "設定管理密碼" : "管理員驗證"}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {passwordMode === "setup"
                ? "這是您第一次使用管理後台，請設定一組管理密碼"
                : "請輸入管理密碼以進入後台"}
            </p>
          </div>

          {passwordMode === "setup" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">新密碼</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="至少4個字元"
                    className="pr-10"
                    onKeyDown={(e) => e.key === "Enter" && handleSetupPassword()}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">確認密碼</Label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再次輸入密碼"
                  onKeyDown={(e) => e.key === "Enter" && handleSetupPassword()}
                />
              </div>
              <Button
                className="h-11 w-full text-sm font-semibold shadow-sm"
                onClick={handleSetupPassword}
                disabled={isVerifying}
              >
                {isVerifying ? "設定中..." : "設定密碼"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">管理密碼</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="請輸入密碼"
                    className="pr-10"
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button
                className="h-11 w-full text-sm font-semibold shadow-sm"
                onClick={handleLogin}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  "驗證中..."
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    進入後台
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const sectionTitle = {
    countdowns: "預設倒數計時",
    announcements: "本站公告",
    maintenance: "維護設定",
    appversion: "版本管理",
    visitstats: "訪問統計",
    password: "變更密碼",
  }[activeSection ?? "countdowns"];

  return (
    <div className="pb-8 animate-fade-in">
      {!activeSection ? (
        <div key="menu" className="space-y-6">
          <div className="mb-6 flex items-center gap-3">
            <span className="section-icon">
              <Shield className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-foreground">網站管理後台</h2>
              <p className="text-xs text-muted-foreground">管理預設倒數計時、公告、維護模式與版本資訊</p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground/40">
                維護設定來源：{maintenanceSource}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <AdminMenuCard
              icon={Clock}
              title="預設倒數計時"
              description="管理學校預設的倒數計時器"
              badge={cdMgr.items.length.toString()}
              onClick={() => setActiveSection("countdowns")}
              stagger={1}
            />
            <AdminMenuCard
              icon={Megaphone}
              title="本站公告"
              description="管理網站公告內容"
              badge={annMgr.items.length.toString()}
              onClick={() => setActiveSection("announcements")}
              stagger={2}
            />
            <AdminMenuCard
              icon={Wrench}
              title="維護設定"
              description="啟用/停用維護模式與顯示設定"
              badge={localMaintenance.isMaintenance ? "開啟" : "關閉"}
              onClick={() => setActiveSection("maintenance")}
              stagger={3}
            />
            <AdminMenuCard
              icon={HardDrive}
              title="版本管理"
              description="管理最新版本號與更新亮點"
              badge={localVersion}
              onClick={() => setActiveSection("appversion")}
              stagger={4}
            />
            <AdminMenuCard
              icon={Eye}
              title="訪問統計"
              description="查看本日、本週、本月等訪問數據"
              badge={`${visitStats.today.toLocaleString()} 今日`}
              onClick={() => setActiveSection("visitstats")}
              stagger={5}
            />
            <AdminMenuCard
              icon={Lock}
              title="變更密碼"
              description="修改管理後台密碼"
              onClick={() => {
                setPasswordMode("setup");
                setActiveSection("password");
              }}
              stagger={6}
            />
          </div>
        </div>
      ) : (
        <div key={activeSection} className="space-y-6 animate-fade-in">
          <div className="mb-6 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveSection(null)}
              className="h-9 w-9 rounded-xl"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h3 className="text-lg font-bold tracking-tight text-foreground">{sectionTitle}</h3>
              <p className="text-[11px] text-muted-foreground">修改後需按儲存才會寫入資料庫</p>
            </div>
          </div>

          <div className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm">
            {activeSection === "countdowns" && (
              <div className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">
                    共 {cdMgr.items.length} 個倒數計時
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => cdMgr.handleAdd({ id: undefined, label: "", target_date: "", start_date: "", progress_label: "進度", grade: "all" })}>
                      <Plus className="mr-1 h-4 w-4" />
                      新增
                    </Button>
                    <Button size="sm" onClick={handleSaveCountdowns} disabled={!cdMgr.changed || cdUpdating}>
                      <Save className="mr-1 h-4 w-4" />
                      {cdUpdating ? "儲存中..." : "儲存變更"}
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap pb-1">
                  <button
                    onClick={() => setCdGradeFilter("all")}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                      cdGradeFilter === "all"
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground/50 hover:text-muted-foreground/80 hover:bg-muted/30"
                    )}
                  >
                    全部
                  </button>
                  {(["7", "8", "9"] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setCdGradeFilter(g)}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                        cdGradeFilter === g
                          ? "bg-primary/15 text-primary"
                          : "text-muted-foreground/50 hover:text-muted-foreground/80 hover:bg-muted/30"
                      )}
                    >
                      {g} 年級
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  {cdMgr.items.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      <Clock className="mx-auto mb-3 h-8 w-8 opacity-30" />
                      <p className="text-sm">尚無倒數計時</p>
                    </div>
                  ) : (
                    cdMgr.items
                      .filter((cd) => cdGradeFilter === "all" || cd.grade === cdGradeFilter)
                      .map((cd) => {
                        const gradeLabel = COUNTDOWN_GRADES.find((g) => g.value === cd.grade)?.label || "全部年級";
                        return (
                          <div
                            key={cd.id}
                            className="flex items-center gap-3 rounded-xl border border-border/40 bg-card p-3.5"
                          >
                            <div className="flex flex-col gap-0.5">
                              <button
                                onClick={() => cdMgr.handleMove(cdMgr.items.indexOf(cd), "up")}
                                disabled={cdMgr.items.indexOf(cd) === 0}
                                className="text-muted-foreground/40 hover:text-primary disabled:opacity-20"
                              >
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
                              </button>
                              <button
                                onClick={() => cdMgr.handleMove(cdMgr.items.indexOf(cd), "down")}
                                disabled={cdMgr.items.indexOf(cd) === cdMgr.items.length - 1}
                                className="text-muted-foreground/40 hover:text-primary disabled:opacity-20"
                              >
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                              </button>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold truncate">{cd.label}</p>
                                {cd.grade && (
                                  <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                                    {gradeLabel}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-muted-foreground font-mono">
                                {new Date(cd.target_date).toLocaleString("zh-TW", { timeZone: TZ_TAIPEI })}
                              </p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg hover:bg-primary/10"
                                onClick={() => cdMgr.handleEdit(cd, (c) => ({ id: c.id, label: c.label, target_date: utcToTaiwanInputStr(c.target_date), start_date: c.start_date ? utcToTaiwanInputStr(c.start_date) : "", progress_label: c.progress_label, grade: c.grade || "all" }))}
                              >
                                <Edit className="h-4 w-4 text-muted-foreground/70" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive/70"
                                onClick={() => cdMgr.setDeleteConfirmId(cd.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            )}

            {activeSection === "announcements" && (
              <div className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">
                    共 {annMgr.items.length} 則公告
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => annMgr.handleAdd({ id: undefined, title: "", date: new Date().toISOString().slice(0, 10), type: "info", pinned: false, content: "", image_url: "" })}>
                      <Plus className="mr-1 h-4 w-4" />
                      新增
                    </Button>
                    <Button size="sm" onClick={handleSaveAnnouncements} disabled={!annMgr.changed || annUpdating}>
                      <Save className="mr-1 h-4 w-4" />
                      {annUpdating ? "儲存中..." : "儲存變更"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {annMgr.items.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      <Megaphone className="mx-auto mb-3 h-8 w-8 opacity-30" />
                      <p className="text-sm">尚無公告</p>
                    </div>
                  ) : (
                    annMgr.items.map((ann, index) => (
                      <div
                        key={ann.id}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border p-3.5",
                          ann.pinned
                            ? "border-primary/30 bg-primary/5"
                            : "border-border/40 bg-card"
                        )}
                      >
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => annMgr.handleMove(index, "up")}
                            disabled={index === 0}
                            className="text-muted-foreground/40 hover:text-primary disabled:opacity-20"
                          >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
                          </button>
                          <button
                            onClick={() => annMgr.handleMove(index, "down")}
                            disabled={index === annMgr.items.length - 1}
                            className="text-muted-foreground/40 hover:text-primary disabled:opacity-20"
                          >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                          </button>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate flex items-center gap-2">
                            {ann.title}
                            {ann.pinned && (
                              <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] text-primary font-bold">置頂</span>
                            )}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {ann.date}
                            <span className="ml-2 text-[10px] uppercase font-bold">{ann.type}</span>
                          </p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-primary/10"
                            onClick={() => annMgr.handleEdit(ann, (a) => ({ id: a.id, title: a.title, date: a.date, type: a.type, pinned: a.pinned, content: a.content, image_url: a.image_url || "" }))}
                          >
                            <Edit className="h-4 w-4 text-muted-foreground/70" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive/70"
                            onClick={() => annMgr.setDeleteConfirmId(ann.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeSection === "maintenance" && (
              <div className="space-y-6 p-5">
                <div className="flex items-center justify-between rounded-xl border border-border/40 bg-card p-4">
                  <div>
                    <p className="text-sm font-semibold">維護模式</p>
                    <p className="text-[10px] text-muted-foreground">啟用後所有頁面將顯示維護公告</p>
                  </div>
                  <Switch
                    checked={localMaintenance.isMaintenance}
                    onCheckedChange={(checked) =>
                      setLocalMaintenance((prev) => ({ ...prev, isMaintenance: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border/40 bg-card p-4">
                  <div>
                    <p className="text-sm font-semibold">顯示倒數計時</p>
                    <p className="text-[10px] text-muted-foreground">在維護公告中顯示剩餘時間</p>
                  </div>
                  <Switch
                    checked={localMaintenance.showTimer}
                    onCheckedChange={(checked) =>
                      setLocalMaintenance((prev) => ({ ...prev, showTimer: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border/40 bg-card p-4">
                  <div>
                    <p className="text-sm font-semibold">維護白名單</p>
                    <p className="text-[10px] text-muted-foreground">啟用後此瀏覽器可跳過維護模式正常使用網站</p>
                  </div>
                  <Switch
                    checked={whitelistEnabled}
                    onCheckedChange={(checked) => {
                      setWhitelistEnabled(checked);
                      setMaintenanceWhitelist(checked);
                    }}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">維護標題</Label>
                  <Input
                    value={localMaintenance.title}
                    onChange={(e) =>
                      setLocalMaintenance((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="例如：系統維護中"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">維護訊息</Label>
                  <Textarea
                    value={localMaintenance.message}
                    onChange={(e) =>
                      setLocalMaintenance((prev) => ({ ...prev, message: e.target.value }))
                    }
                    className="min-h-[80px]"
                    placeholder="請輸入維護說明..."
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">預計完成時間</Label>
                  <Input
                    type="datetime-local"
                    value={localMaintenance.maintenanceEndTime
                      ? new Date(localMaintenance.maintenanceEndTime).toISOString().slice(0, 16)
                      : ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        setLocalMaintenance((prev) => ({
                          ...prev,
                          maintenanceEndTime: new Date(val).toISOString(),
                        }));
                      }
                    }}
                  />
                </div>

                <Button
                  className="h-11 w-full text-sm font-semibold shadow-sm"
                  onClick={handleSaveMaintenance}
                  disabled={isUpdatingConfig}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isUpdatingConfig ? "儲存中..." : "儲存維護設定"}
                </Button>
              </div>
            )}

            {activeSection === "appversion" && (
              <div className="space-y-6 p-5">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">最新版本號</Label>
                  <Input
                    value={localVersion}
                    onChange={(e) => setLocalVersion(e.target.value)}
                    className="font-mono"
                    placeholder="例如：v1.5.4"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">更新亮點</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocalHighlights((prev) => [...prev, ""])}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      新增
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {localHighlights.map((hl, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          value={hl}
                          onChange={(e) => {
                            const newList = [...localHighlights];
                            newList[idx] = e.target.value;
                            setLocalHighlights(newList);
                          }}
                          className="flex-1"
                          placeholder="輸入更新亮點..."
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 shrink-0 rounded-lg hover:bg-destructive/10 text-destructive/70"
                          onClick={() =>
                            setLocalHighlights((prev) => prev.filter((_, i) => i !== idx))
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  className="h-11 w-full text-sm font-semibold shadow-sm"
                  onClick={handleSaveAppVersion}
                  disabled={isUpdatingConfig}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isUpdatingConfig ? "儲存中..." : "儲存版本資訊"}
                </Button>
              </div>
            )}

            {activeSection === "visitstats" && (
              <div className="space-y-6 p-5">
                {statsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-lg font-bold tracking-tight">訪問趨勢</h3>
                        <p className="text-xs text-muted-foreground">每 2 分鐘自動更新</p>
                      </div>
                      <div className="inline-flex items-center gap-1 rounded-xl border border-border/30 bg-muted/30 p-1">
                        {[7, 30, 90].map((range) => (
                          <button
                            key={range}
                            onClick={() => setSelectedRange(range)}
                            className={cn(
                              "rounded-lg px-4 py-1.5 text-xs font-bold transition-all",
                              selectedRange === range
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                          >
                            {range} 天
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-border/20 bg-card p-4">
                      {dailyVisits.length > 0 ? (
                        <VisitBarChart data={dailyVisits} />
                      ) : (
                        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
                          尚無每日數據，SQL migration 執行後開始累計
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                      <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Eye className="h-4 w-4 text-primary" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70">本日</span>
                        </div>
                        <p className="text-2xl font-bold tracking-tight text-foreground">
                          {visitStats.today.toLocaleString()}
                        </p>
                      </div>

                      <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70">本週</span>
                        </div>
                        <p className="text-2xl font-bold tracking-tight text-foreground">
                          {visitStats.this_week.toLocaleString()}
                        </p>
                      </div>

                      <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CalendarDays className="h-4 w-4 text-primary" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70">本月</span>
                        </div>
                        <p className="text-2xl font-bold tracking-tight text-foreground">
                          {visitStats.this_month.toLocaleString()}
                        </p>
                      </div>

                      <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CalendarDays className="h-4 w-4 text-primary" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70">本年</span>
                        </div>
                        <p className="text-2xl font-bold tracking-tight text-foreground">
                          {visitStats.this_year.toLocaleString()}
                        </p>
                      </div>

                      <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70">總計</span>
                        </div>
                        <p className="text-2xl font-bold tracking-tight text-foreground">
                          {visitStats.total.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeSection === "password" && (
              <div className="space-y-6 p-5">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">新密碼</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="至少4個字元"
                      className="pr-10"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">確認新密碼</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再次輸入新密碼"
                  />
                </div>
                <Button
                  className="h-11 w-full text-sm font-semibold shadow-sm"
                  onClick={handleChangePassword}
                  disabled={isUpdatingConfig}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isUpdatingConfig ? "儲存中..." : "變更密碼"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <Dialog open={cdMgr.dialogOpen} onOpenChange={cdMgr.setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {cdMgr.editing?.id ? "編輯倒數計時" : "新增倒數計時"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">標題</Label>
              <Input
                value={cdMgr.editing?.label || ""}
                onChange={(e) =>
                  cdMgr.setEditing((prev) => (prev ? { ...prev, label: e.target.value } : null))
                }
                placeholder="例如：寒假倒數"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">目標日期時間</Label>
              <Input
                type="datetime-local"
                value={cdMgr.editing?.target_date || ""}
                onChange={(e) =>
                  cdMgr.setEditing((prev) => (prev ? { ...prev, target_date: e.target.value } : null))
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">開始日期時間（選填）</Label>
              <Input
                type="datetime-local"
                value={cdMgr.editing?.start_date || ""}
                onChange={(e) =>
                  cdMgr.setEditing((prev) => (prev ? { ...prev, start_date: e.target.value } : null))
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">進度條標籤（選填）</Label>
              <Input
                value={cdMgr.editing?.progress_label || ""}
                onChange={(e) =>
                  cdMgr.setEditing((prev) => (prev ? { ...prev, progress_label: e.target.value } : null))
                }
                placeholder="例如：學期進度"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">適用年級</Label>
              <Select
                value={cdMgr.editing?.grade ?? "all"}
                onValueChange={(value) =>
                  cdMgr.setEditing((prev) => (prev ? { ...prev, grade: value } : null))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="全部年級" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTDOWN_GRADES.map((g) => (
                    <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                cdMgr.setDialogOpen(false);
                cdMgr.setEditing(null);
              }}
            >
              取消
            </Button>
            <Button onClick={handleSaveCountdown}>
              儲存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={annMgr.dialogOpen} onOpenChange={annMgr.setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {annMgr.editing?.id ? "編輯公告" : "新增公告"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">標題</Label>
              <Input
                value={annMgr.editing?.title || ""}
                onChange={(e) =>
                  annMgr.setEditing((prev) => (prev ? { ...prev, title: e.target.value } : null))
                }
                placeholder="公告標題"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">日期</Label>
                <Input
                  type="date"
                  value={annMgr.editing?.date || ""}
                  onChange={(e) =>
                    annMgr.setEditing((prev) => (prev ? { ...prev, date: e.target.value } : null))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">類型</Label>
                <Select
                  value={annMgr.editing?.type || "info"}
                  onValueChange={(value) =>
                    annMgr.setEditing((prev) => (prev ? { ...prev, type: value } : null))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">資訊</SelectItem>
                    <SelectItem value="update">更新</SelectItem>
                    <SelectItem value="alert">重要</SelectItem>
                    <SelectItem value="maintenance">維護</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-card p-4">
              <Switch
                checked={annMgr.editing?.pinned || false}
                onCheckedChange={(checked) =>
                  annMgr.setEditing((prev) => (prev ? { ...prev, pinned: checked } : null))
                }
              />
              <div>
                <p className="text-sm font-semibold">置頂公告</p>
                <p className="text-[10px] text-muted-foreground">置頂公告將顯示在列表最上方</p>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-semibold">自訂圖片（選填）</Label>
              {annMgr.editing?.image_url && (
                <div className="relative rounded-xl overflow-hidden border border-border/50 aspect-video bg-muted/30">
                  <img src={annMgr.editing.image_url} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  <button
                    type="button"
                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                    onClick={() => annMgr.setEditing((prev) => (prev ? { ...prev, image_url: "" } : null))}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => document.getElementById("ann-image-upload")?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {SUPABASE_ENABLED ? "上傳圖片" : "選擇圖片"}
                </Button>
                <input
                  id="ann-image-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadImage(file);
                    e.target.value = "";
                  }}
                />
              </div>
              <div className="relative">
                <Input
                  className="pr-9"
                  value={annMgr.editing?.image_url || ""}
                  onChange={(e) =>
                    annMgr.setEditing((prev) => (prev ? { ...prev, image_url: e.target.value } : null))
                  }
                  placeholder="或貼上圖片網址..."
                />
                {annMgr.editing?.image_url && (
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => annMgr.setEditing((prev) => (prev ? { ...prev, image_url: "" } : null))}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">內容（選填）</Label>
              <Textarea
                className="min-h-[120px]"
                value={annMgr.editing?.content || ""}
                onChange={(e) =>
                  annMgr.setEditing((prev) => (prev ? { ...prev, content: e.target.value } : null))
                }
                placeholder="公告詳細內容..."
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                annMgr.setDialogOpen(false);
                annMgr.setEditing(null);
              }}
            >
              取消
            </Button>
            <Button onClick={handleSaveAnnouncement}>
              儲存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!cdMgr.deleteConfirmId}
        onOpenChange={(open) => !open && cdMgr.setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold">確認刪除</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              確定要刪除此倒數計時嗎？此操作無法復原。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cdMgr.deleteConfirmId && cdMgr.handleDelete(cdMgr.deleteConfirmId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              確認刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!annMgr.deleteConfirmId}
        onOpenChange={(open) => !open && annMgr.setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold">確認刪除</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              確定要刪除此公告嗎？此操作無法復原。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => annMgr.deleteConfirmId && annMgr.handleDelete(annMgr.deleteConfirmId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              確認刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AdminMenuCard({
  icon: Icon,
  title,
  description,
  badge,
  onClick,
  stagger,
}: {
  icon: typeof Shield;
  title: string;
  description: string;
  badge?: string;
  onClick: () => void;
  stagger: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex w-full items-center gap-4 overflow-hidden rounded-xl border border-border/50 bg-card p-4 text-left transition-all animate-fade-in hover:shadow-md hover:border-primary/30",
        `animate-stagger-${stagger}`
      )}
    >
      <span className="section-icon">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold tracking-tight text-foreground">{title}</span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">{description}</span>
      </span>
      {badge !== undefined && (
        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
          {badge}
        </span>
      )}
    </button>
  );
}
