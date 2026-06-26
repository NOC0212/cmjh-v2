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
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
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
import { useSiteCountdowns, SiteCountdown } from "@/hooks/useSiteCountdowns";
import { useSiteAnnouncements, SiteAnnouncement } from "@/hooks/useSiteAnnouncements";
import { useSiteConfig, isAdminAuthenticated, verifyAdminPassword, hasAdminPassword, setStoredPassword } from "@/hooks/useSiteConfig";
import { supabase, SUPABASE_ENABLED } from "@/lib/supabase";
import { useVisitStats, DailyVisit } from "@/hooks/useVisitStats";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { hashPassword } from "@/lib/crypto";
import { isMaintenanceWhitelisted, setMaintenanceWhitelist } from "@/lib/app-version";

type AdminSection = "countdowns" | "announcements" | "maintenance" | "appversion" | "password" | "visitstats" | null;

interface EditingCountdown {
  id?: string;
  label: string;
  target_date: string;
  start_date: string;
  progress_label: string;
  grade: string;
}

const COUNTDOWN_GRADES = [
  { value: "all", label: "全部年級" },
  { value: "7", label: "七年級" },
  { value: "8", label: "八年級" },
  { value: "9", label: "九年級" },
];

interface EditingAnnouncement {
  id?: string;
  title: string;
  date: string;
  type: string;
  pinned: boolean;
  content: string;
  image_url: string;
}

const TZ_TAIPEI = "Asia/Taipei";

// 將 UTC ISO 字串轉為 datetime-local input 需要的 Taiwan 時間字串 (YYYY-MM-DDTHH:mm)
const utcToTaiwanInputStr = (isoStr: string): string => {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  return new Date(d.getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 16);
};

// 將 datetime-local input 的字串（視為台灣時間）轉為 UTC ISO 字串
const taiwanInputToUtc = (inputStr: string): string => {
  if (!inputStr) return "";
  const d = new Date(inputStr + "+08:00");
  return d.toISOString();
};

export function AdminPanel() {
  const { toast } = useToast();
  const { countdowns, isConfigured: cdConfigured, updateCountdowns, isUpdating: cdUpdating } = useSiteCountdowns();
  const { announcements, isConfigured: annConfigured, updateAnnouncements, isUpdating: annUpdating } = useSiteAnnouncements();
  const { maintenance, appVersion, isConfigured: cfgConfigured, updateConfig, isUpdatingConfig } = useSiteConfig();
  const [selectedRange, setSelectedRange] = useState<number>(30);
  const { stats: visitStats, dailyVisits, isLoading: statsLoading } = useVisitStats(selectedRange);

  const [authenticated, setAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [isPasswordSet, setIsPasswordSet] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeSection, setActiveSection] = useState<AdminSection>(null);
  const [passwordMode, setPasswordMode] = useState<"login" | "setup">("login");

  // Password setup
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Editing state for countdowns
  const [localCountdowns, setLocalCountdowns] = useState<SiteCountdown[]>([]);
  const [cdDialogOpen, setCdDialogOpen] = useState(false);
  const [editingCd, setEditingCd] = useState<EditingCountdown | null>(null);
  const [cdDeleteConfirm, setCdDeleteConfirm] = useState<string | null>(null);
  const [cdGradeFilter, setCdGradeFilter] = useState<string>("all");

  // Editing state for announcements
  const [localAnnouncements, setLocalAnnouncements] = useState<SiteAnnouncement[]>([]);
  const [annDialogOpen, setAnnDialogOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState<EditingAnnouncement | null>(null);
  const [annDeleteConfirm, setAnnDeleteConfirm] = useState<string | null>(null);

  // Maintenance editing
  const [localMaintenance, setLocalMaintenance] = useState({
    isMaintenance: false,
    showTimer: true,
    maintenanceEndTime: "",
    title: "",
    message: "",
  });
  const [whitelistEnabled, setWhitelistEnabled] = useState(() => isMaintenanceWhitelisted());

  // App version editing
  const [localVersion, setLocalVersion] = useState("");
  const [localHighlights, setLocalHighlights] = useState<string[]>([]);

  // Initialize local state from data
  useEffect(() => {
    if (countdowns.length > 0) {
      setLocalCountdowns([...countdowns]);
    }
  }, [countdowns]);

  useEffect(() => {
    if (announcements.length > 0) {
      setLocalAnnouncements([...announcements]);
    }
  }, [announcements]);

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

  // Check authentication on mount
  useEffect(() => {
    if (isAdminAuthenticated()) {
      setAuthenticated(true);
    }
    // Check if password is set
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
      // 儲存 SHA-256 雜湊，不儲存原始密碼
      setStoredPassword(await hashPassword(passwordInput));
      setAuthenticated(true);
      toast({ title: "驗證成功", description: "歡迎進入管理後台" });
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
      // updateConfig 內部已儲存雜湊，無需再呼叫 setStoredPassword
      setAuthenticated(true);
      setIsPasswordSet(true);
      toast({ title: "密碼設定成功", description: "請妥善保管您的密碼" });
    } catch (err) {
      toast({ title: "設定失敗", description: String(err), variant: "destructive" });
    }
    setIsVerifying(false);
  };

  // *** Countdown Operations ***
  const handleAddCountdown = () => {
    setEditingCd({ id: undefined, label: "", target_date: "", start_date: "", progress_label: "進度", grade: "all" });
    setCdDialogOpen(true);
  };

  const handleEditCountdown = (cd: SiteCountdown) => {
    setEditingCd({
      id: cd.id,
      label: cd.label,
      target_date: utcToTaiwanInputStr(cd.target_date),
      start_date: cd.start_date ? utcToTaiwanInputStr(cd.start_date) : "",
      progress_label: cd.progress_label,
      grade: cd.grade || "all",
    });
    setCdDialogOpen(true);
  };

  const handleSaveCountdown = () => {
    if (!editingCd || !editingCd.label || !editingCd.target_date) {
      toast({ title: "請填寫標題和目標日期", variant: "destructive" });
      return;
    }

    const newCountdown: SiteCountdown = {
      id: editingCd.id || `admin-cd-${Date.now()}`,
      label: editingCd.label,
      target_date: taiwanInputToUtc(editingCd.target_date),
      start_date: editingCd.start_date ? taiwanInputToUtc(editingCd.start_date) : null,
      progress_label: editingCd.progress_label || "進度",
      sort_order: editingCd.id
        ? localCountdowns.find((c) => c.id === editingCd.id)?.sort_order ?? localCountdowns.length
        : localCountdowns.length,
      active: true,
      grade: editingCd.grade === "all" ? null : editingCd.grade,
    };

    if (editingCd.id && localCountdowns.some((c) => c.id === editingCd.id)) {
      setLocalCountdowns((prev) => prev.map((c) => (c.id === editingCd.id ? newCountdown : c)));
    } else {
      setLocalCountdowns((prev) => [...prev, newCountdown]);
    }

    setCdDialogOpen(false);
    setEditingCd(null);
  };

  const handleDeleteCountdown = (id: string) => {
    setLocalCountdowns((prev) => prev.filter((c) => c.id !== id));
    setCdDeleteConfirm(null);
  };

  const handleMoveCd = (index: number, direction: "up" | "down") => {
    const newList = [...localCountdowns];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newList.length) return;
    [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];
    setLocalCountdowns(newList.map((c, i) => ({ ...c, sort_order: i })));
  };

  const handleSaveCountdowns = async () => {
    try {
      await updateCountdowns(localCountdowns);
      toast({ title: "儲存成功", description: "預設倒數計時已更新" });
    } catch (err) {
      toast({ title: "儲存失敗", description: String(err), variant: "destructive" });
    }
  };

  // *** Announcement Operations ***
  const handleAddAnnouncement = () => {
    setEditingAnn({
      id: undefined,
      title: "",
      date: new Date().toISOString().slice(0, 10),
      type: "info",
      pinned: false,
      content: "",
      image_url: "",
    });
    setAnnDialogOpen(true);
  };

  const handleEditAnnouncement = (ann: SiteAnnouncement) => {
    setEditingAnn({
      id: ann.id,
      title: ann.title,
      date: ann.date,
      type: ann.type,
      pinned: ann.pinned,
      content: ann.content,
      image_url: ann.image_url || "",
    });
    setAnnDialogOpen(true);
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
      // 刪除舊圖片（如果是從 Supabase Storage 上傳的）
      const oldUrl = editingAnn?.image_url;
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
      setEditingAnn((prev) => (prev ? { ...prev, image_url: urlData.publicUrl } : null));
      toast({ title: "上傳成功" });
    } catch (err) {
      toast({ title: "上傳失敗", description: String(err), variant: "destructive" });
    }
  };

  const handleSaveAnnouncement = () => {
    if (!editingAnn || !editingAnn.title || !editingAnn.date) {
      toast({ title: "請填寫標題和日期", variant: "destructive" });
      return;
    }

    const newAnnouncement: SiteAnnouncement = {
      id: editingAnn.id || `admin-ann-${Date.now()}`,
      title: editingAnn.title,
      date: editingAnn.date,
      type: editingAnn.type,
      pinned: editingAnn.pinned,
      content: editingAnn.content || "",
      image_url: editingAnn.image_url || undefined,
      sort_order: editingAnn.id
        ? localAnnouncements.find((a) => a.id === editingAnn.id)?.sort_order ?? localAnnouncements.length
        : localAnnouncements.length,
      active: true,
    };

    if (editingAnn.id && localAnnouncements.some((a) => a.id === editingAnn.id)) {
      setLocalAnnouncements((prev) => prev.map((a) => (a.id === editingAnn.id ? newAnnouncement : a)));
    } else {
      setLocalAnnouncements((prev) => [...prev, newAnnouncement]);
    }

    setAnnDialogOpen(false);
    setEditingAnn(null);
  };

  const handleDeleteAnnouncement = (id: string) => {
    setLocalAnnouncements((prev) => prev.filter((a) => a.id !== id));
    setAnnDeleteConfirm(null);
  };

  const handleMoveAnn = (index: number, direction: "up" | "down") => {
    const newList = [...localAnnouncements];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newList.length) return;
    [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];
    setLocalAnnouncements(newList.map((a, i) => ({ ...a, sort_order: i })));
  };

  const handleSaveAnnouncements = async () => {
    try {
      await updateAnnouncements(localAnnouncements);
      toast({ title: "儲存成功", description: "本站公告已更新" });
    } catch (err) {
      toast({ title: "儲存失敗", description: String(err), variant: "destructive" });
    }
  };

  // *** Maintenance Operations ***
  const handleSaveMaintenance = async () => {
    try {
      await updateConfig({ maintenance: localMaintenance });
      toast({ title: "儲存成功", description: "維護設定已更新" });
    } catch (err) {
      toast({ title: "儲存失敗", description: String(err), variant: "destructive" });
    }
  };

  // *** App Version Operations ***
  const handleSaveAppVersion = async () => {
    try {
      await updateConfig({
        appVersion: { latestVersion: localVersion, releaseHighlights: localHighlights },
      });
      toast({ title: "儲存成功", description: "版本資訊已更新" });
    } catch (err) {
      toast({ title: "儲存失敗", description: String(err), variant: "destructive" });
    }
  };

  // *** Password Change ***
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
      // updateConfig 內部已儲存雜湊
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMode("login");
      toast({ title: "密碼變更成功" });
    } catch (err) {
      toast({ title: "變更失敗", description: String(err), variant: "destructive" });
    }
  };

  // 確認目前的維護設定來源（供除錯用）
  const maintenanceSource = maintenance ? (SUPABASE_ENABLED ? "Supabase" : "JSON 備份") : "無資料";

  // Check if Supabase is configured
  if (!SUPABASE_ENABLED || isPasswordSet === null) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-6 rounded-3xl bg-muted p-6">
          <Shield className="h-12 w-12 text-muted-foreground/40" />
        </div>
        <h3 className="text-xl font-bold text-muted-foreground">管理後台暫不可用</h3>
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

  // Password gate
  if (!authenticated) {
    return (
      <div className="mx-auto max-w-md py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-border/50 bg-card p-8 shadow-lg text-foreground"
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              {passwordMode === "setup" ? (
                <Lock className="h-8 w-8 text-primary" />
              ) : (
                <Shield className="h-8 w-8 text-primary" />
              )}
            </div>
            <h2 className="text-2xl font-black tracking-tight">
              {passwordMode === "setup" ? "設定管理密碼" : "管理員驗證"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {passwordMode === "setup"
                ? "這是您第一次使用管理後台，請設定一組管理密碼"
                : "請輸入管理密碼以進入後台"}
            </p>
          </div>

          {passwordMode === "setup" ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>新密碼</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="至少4個字元"
                    className="rounded-xl pr-10"
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
                <Label>確認密碼</Label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再次輸入密碼"
                  className="rounded-xl"
                  onKeyDown={(e) => e.key === "Enter" && handleSetupPassword()}
                />
              </div>
              <Button
                className="h-12 w-full rounded-xl text-base font-bold shadow-lg"
                onClick={handleSetupPassword}
                disabled={isVerifying}
              >
                {isVerifying ? "設定中..." : "設定密碼"}
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>管理密碼</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="請輸入密碼"
                    className="rounded-xl pr-10"
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
                className="h-12 w-full rounded-xl text-base font-bold shadow-lg"
                onClick={handleLogin}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  "驗證中..."
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    進入後台
                  </>
                )}
              </Button>
            </div>
          )}
        </motion.div>
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

  const countdownsChanged = JSON.stringify(localCountdowns) !== JSON.stringify(countdowns);
  const announcementsChanged = JSON.stringify(localAnnouncements) !== JSON.stringify(announcements);

  return (
    <div className="min-h-[500px] pb-8 text-foreground">
      {!activeSection ? (
        /* Main Menu */
        <motion.div
          key="menu"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-6"
        >
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">網站管理後台</h2>
              <p className="text-xs text-muted-foreground">管理預設倒數計時、公告、維護模式與版本資訊</p>
            <p className="text-[10px] text-muted-foreground/50 font-mono mt-1">
              維護設定來源：{maintenanceSource}
            </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <AdminMenuCard
              icon={Clock}
              title="預設倒數計時"
              description="管理學校預設的倒數計時器"
              color="blue"
              badge={localCountdowns.length.toString()}
              onClick={() => setActiveSection("countdowns")}
            />
            <AdminMenuCard
              icon={Megaphone}
              title="本站公告"
              description="管理網站公告內容"
              color="purple"
              badge={localAnnouncements.length.toString()}
              onClick={() => setActiveSection("announcements")}
            />
            <AdminMenuCard
              icon={Wrench}
              title="維護設定"
              description="啟用/停用維護模式與顯示設定"
              color="orange"
              badge={localMaintenance.isMaintenance ? "開啟" : "關閉"}
              onClick={() => setActiveSection("maintenance")}
            />
            <AdminMenuCard
              icon={HardDrive}
              title="版本管理"
              description="管理最新版本號與更新亮點"
              color="green"
              badge={localVersion}
              onClick={() => setActiveSection("appversion")}
            />
            <AdminMenuCard
              icon={Eye}
              title="訪問統計"
              description="查看本日、本週、本月等訪問數據"
              color="blue"
              badge={`${visitStats.today.toLocaleString()} 今日`}
              onClick={() => setActiveSection("visitstats")}
            />
            <AdminMenuCard
              icon={Lock}
              title="變更密碼"
              description="修改管理後台密碼"
              color="red"
              onClick={() => {
                setPasswordMode("setup");
                setActiveSection("password");
              }}
            />
          </div>
        </motion.div>
      ) : (
        /* Section Content */
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className="mb-8 flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setActiveSection(null)}
              className="h-10 w-10 rounded-2xl border-border/40 hover:bg-muted"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h3 className="text-xl font-bold tracking-tight">{sectionTitle}</h3>
              <p className="text-xs text-muted-foreground">修改後需按儲存才會寫入資料庫</p>
            </div>
          </div>

          <div className="rounded-[32px] border border-border/20 bg-muted/10 p-2 backdrop-blur-sm">
            {/* Countdowns Section */}
            {activeSection === "countdowns" && (
              <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-muted-foreground">
                    共 {localCountdowns.length} 個倒數計時
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl"
                      onClick={handleAddCountdown}
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      新增
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-xl shadow-lg"
                      onClick={handleSaveCountdowns}
                      disabled={!countdownsChanged || cdUpdating}
                    >
                      <Save className="mr-1 h-4 w-4" />
                      {cdUpdating ? "儲存中..." : "儲存變更"}
                    </Button>
                  </div>
                </div>

                {/* Grade filter tabs */}
                <div className="flex gap-2 flex-wrap pb-2">
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
                  {localCountdowns.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      <Clock className="mx-auto mb-3 h-8 w-8 opacity-30" />
                      <p className="text-sm">尚無倒數計時</p>
                    </div>
                  ) : (
                    localCountdowns
                      .filter(cd => cdGradeFilter === "all" || cd.grade === cdGradeFilter)
                      .map((cd, index) => {
                        const gradeLabel = COUNTDOWN_GRADES.find(g => g.value === cd.grade)?.label || "全部年級";
                        return (
                        <div
                          key={cd.id}
                          className="flex items-center gap-3 rounded-2xl border border-border/40 bg-card p-4"
                        >
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => handleMoveCd(index, "up")}
                              disabled={index === 0}
                              className="text-muted-foreground/40 hover:text-primary disabled:opacity-20"
                            >
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
                            </button>
                            <button
                              onClick={() => handleMoveCd(index, "down")}
                              disabled={index === localCountdowns.length - 1}
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
                              onClick={() => handleEditCountdown(cd)}
                            >
                              <Edit className="h-4 w-4 text-muted-foreground/70" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive/70"
                              onClick={() => setCdDeleteConfirm(cd.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );})
                  )}
                </div>
              </div>
            )}

            {/* Announcements Section */}
            {activeSection === "announcements" && (
              <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-muted-foreground">
                    共 {localAnnouncements.length} 則公告
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl"
                      onClick={handleAddAnnouncement}
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      新增
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-xl shadow-lg"
                      onClick={handleSaveAnnouncements}
                      disabled={!announcementsChanged || annUpdating}
                    >
                      <Save className="mr-1 h-4 w-4" />
                      {annUpdating ? "儲存中..." : "儲存變更"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {localAnnouncements.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      <Megaphone className="mx-auto mb-3 h-8 w-8 opacity-30" />
                      <p className="text-sm">尚無公告</p>
                    </div>
                  ) : (
                    localAnnouncements.map((ann, index) => (
                      <div
                        key={ann.id}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border p-4",
                          ann.pinned
                            ? "border-primary/30 bg-primary/5"
                            : "border-border/40 bg-card"
                        )}
                      >
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => handleMoveAnn(index, "up")}
                            disabled={index === 0}
                            className="text-muted-foreground/40 hover:text-primary disabled:opacity-20"
                          >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
                          </button>
                          <button
                            onClick={() => handleMoveAnn(index, "down")}
                            disabled={index === localAnnouncements.length - 1}
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
                            onClick={() => handleEditAnnouncement(ann)}
                          >
                            <Edit className="h-4 w-4 text-muted-foreground/70" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive/70"
                            onClick={() => setAnnDeleteConfirm(ann.id)}
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

            {/* Maintenance Section */}
            {activeSection === "maintenance" && (
              <div className="space-y-6 p-6">
                <div className="flex items-center justify-between rounded-2xl border border-border/40 bg-card p-5">
                  <div>
                    <p className="text-sm font-bold">維護模式</p>
                    <p className="text-[10px] text-muted-foreground">啟用後所有頁面將顯示維護公告</p>
                  </div>
                  <Switch
                    checked={localMaintenance.isMaintenance}
                    onCheckedChange={(checked) =>
                      setLocalMaintenance((prev) => ({ ...prev, isMaintenance: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-border/40 bg-card p-5">
                  <div>
                    <p className="text-sm font-bold">顯示倒數計時</p>
                    <p className="text-[10px] text-muted-foreground">在維護公告中顯示剩餘時間</p>
                  </div>
                  <Switch
                    checked={localMaintenance.showTimer}
                    onCheckedChange={(checked) =>
                      setLocalMaintenance((prev) => ({ ...prev, showTimer: checked }))
                    }
                  />
                </div>

                {/* 維護白名單（本機 localStorage，不寫入資料庫） */}
                <div className="flex items-center justify-between rounded-2xl border border-border/40 bg-card p-5">
                  <div>
                    <p className="text-sm font-bold">維護白名單</p>
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

                <div className="space-y-2">
                  <Label>維護標題</Label>
                  <Input
                    value={localMaintenance.title}
                    onChange={(e) =>
                      setLocalMaintenance((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="rounded-xl"
                    placeholder="例如：系統維護中"
                  />
                </div>

                <div className="space-y-2">
                  <Label>維護訊息</Label>
                  <Textarea
                    value={localMaintenance.message}
                    onChange={(e) =>
                      setLocalMaintenance((prev) => ({ ...prev, message: e.target.value }))
                    }
                    className="rounded-xl min-h-[80px]"
                    placeholder="請輸入維護說明..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>預計完成時間</Label>
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
                    className="rounded-xl"
                  />
                </div>

                <Button
                  className="h-12 w-full rounded-xl text-base font-bold shadow-lg"
                  onClick={handleSaveMaintenance}
                  disabled={isUpdatingConfig}
                >
                  <Save className="mr-2 h-5 w-5" />
                  {isUpdatingConfig ? "儲存中..." : "儲存維護設定"}
                </Button>
              </div>
            )}

            {/* App Version Section */}
            {activeSection === "appversion" && (
              <div className="space-y-6 p-6">
                <div className="space-y-2">
                  <Label>最新版本號</Label>
                  <Input
                    value={localVersion}
                    onChange={(e) => setLocalVersion(e.target.value)}
                    className="rounded-xl font-mono"
                    placeholder="例如：v1.5.4"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>更新亮點</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
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
                          className="rounded-xl flex-1"
                          placeholder="輸入更新亮點..."
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-xl hover:bg-destructive/10 text-destructive/70 shrink-0"
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
                  className="h-12 w-full rounded-xl text-base font-bold shadow-lg"
                  onClick={handleSaveAppVersion}
                  disabled={isUpdatingConfig}
                >
                  <Save className="mr-2 h-5 w-5" />
                  {isUpdatingConfig ? "儲存中..." : "儲存版本資訊"}
                </Button>
              </div>
            )}

            {/* Visit Stats Section */}
            {activeSection === "visitstats" && (
              <div className="space-y-6 p-6">
                {statsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                  </div>
                ) : (
                  <>
                    {/* 時間範圍選擇器 */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-lg font-black tracking-tight">訪問趨勢</h3>
                        <p className="text-xs text-muted-foreground">每 2 分鐘自動更新</p>
                      </div>
                      <div className="inline-flex items-center gap-1 rounded-2xl border border-border/30 bg-muted/30 p-1">
                        {[7, 30, 90].map((range) => (
                          <button
                            key={range}
                            onClick={() => setSelectedRange(range)}
                            className={cn(
                              "rounded-xl px-5 py-2 text-sm font-bold transition-all",
                              selectedRange === range
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                          >
                            {range} 天
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 圖表 */}
                    <div className="rounded-3xl border border-border/20 bg-card p-4 md:p-6">
                      {dailyVisits.length > 0 ? (
                        <ChartContainer
                          config={{
                            visits: {
                              label: "訪問次數",
                              color: "hsl(var(--primary))",
                            },
                          }}
                          className="aspect-[2] md:aspect-[3.5] w-full"
                        >
                          <AreaChart data={dailyVisits} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="visitGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
                            <XAxis
                              dataKey="date"
                              tickFormatter={(val: string) => {
                                const d = new Date(val + "T00:00:00");
                                return `${d.getMonth() + 1}/${d.getDate()}`;
                              }}
                              tick={{ fontSize: 11 }}
                              tickLine={false}
                              axisLine={false}
                              interval="preserveStartEnd"
                            />
                            <YAxis
                              tick={{ fontSize: 11 }}
                              tickLine={false}
                              axisLine={false}
                              allowDecimals={false}
                            />
                            <ChartTooltip
                              content={
                                <ChartTooltipContent
                                  labelFormatter={(label: string) => {
                                    const d = new Date(label + "T00:00:00");
                                    return d.toLocaleDateString("zh-TW", {
                                      year: "numeric",
                                      month: "2-digit",
                                      day: "2-digit",
                                      weekday: "short",
                                    });
                                  }}
                                  indicator="line"
                                />
                              }
                            />
                            <Area
                              type="monotone"
                              dataKey="count"
                              name="visits"
                              stroke="hsl(var(--primary))"
                              strokeWidth={2.5}
                              fill="url(#visitGradient)"
                              dot={false}
                              activeDot={{ r: 5, strokeWidth: 2, stroke: "hsl(var(--background))", fill: "hsl(var(--primary))" }}
                            />
                          </AreaChart>
                        </ChartContainer>
                      ) : (
                        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
                          尚無每日數據，SQL migration 執行後開始累計
                        </div>
                      )}
                    </div>

                    {/* 統計摘要卡片 */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                      {/* 今日 */}
                      <div className="relative overflow-hidden rounded-2xl border border-blue-500/15 bg-gradient-to-br from-blue-500/[0.08] to-transparent p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Eye className="h-4 w-4 text-blue-500" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500/70">本日</span>
                        </div>
                        <p className="text-2xl font-black tracking-tight text-blue-600 dark:text-blue-400">
                          {visitStats.today.toLocaleString()}
                        </p>
                      </div>

                      {/* 本週 */}
                      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/[0.08] to-transparent p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-emerald-500" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500/70">本週</span>
                        </div>
                        <p className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                          {visitStats.this_week.toLocaleString()}
                        </p>
                      </div>

                      {/* 本月 */}
                      <div className="relative overflow-hidden rounded-2xl border border-violet-500/15 bg-gradient-to-br from-violet-500/[0.08] to-transparent p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CalendarDays className="h-4 w-4 text-violet-500" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-violet-500/70">本月</span>
                        </div>
                        <p className="text-2xl font-black tracking-tight text-violet-600 dark:text-violet-400">
                          {visitStats.this_month.toLocaleString()}
                        </p>
                      </div>

                      {/* 本年 */}
                      <div className="relative overflow-hidden rounded-2xl border border-amber-500/15 bg-gradient-to-br from-amber-500/[0.08] to-transparent p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CalendarDays className="h-4 w-4 text-amber-500" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500/70">本年</span>
                        </div>
                        <p className="text-2xl font-black tracking-tight text-amber-600 dark:text-amber-400">
                          {visitStats.this_year.toLocaleString()}
                        </p>
                      </div>

                      {/* 總計 */}
                      <div className="relative overflow-hidden rounded-2xl border border-rose-500/15 bg-gradient-to-br from-rose-500/[0.08] to-transparent p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-rose-500" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500/70">總計</span>
                        </div>
                        <p className="text-2xl font-black tracking-tight text-rose-600 dark:text-rose-400">
                          {visitStats.total.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Password Change Section */}
            {activeSection === "password" && (
              <div className="space-y-6 p-6">
                <div className="space-y-2">
                  <Label>新密碼</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="至少4個字元"
                      className="rounded-xl pr-10"
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
                  <Label>確認新密碼</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再次輸入新密碼"
                    className="rounded-xl"
                  />
                </div>
                <Button
                  className="h-12 w-full rounded-xl text-base font-bold shadow-lg"
                  onClick={handleChangePassword}
                  disabled={isUpdatingConfig}
                >
                  <Save className="mr-2 h-5 w-5" />
                  {isUpdatingConfig ? "儲存中..." : "變更密碼"}
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Countdown Edit Dialog */}
      <Dialog open={cdDialogOpen} onOpenChange={setCdDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md rounded-3xl border-primary/20 bg-background dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingCd?.id ? "編輯倒數計時" : "新增倒數計時"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-6">
            <div className="space-y-2">
              <Label className="text-sm font-bold ml-1">標題</Label>
              <Input
                className="rounded-xl border-primary/10 bg-muted/30"
                value={editingCd?.label || ""}
                onChange={(e) =>
                  setEditingCd((prev) => (prev ? { ...prev, label: e.target.value } : null))
                }
                placeholder="例如：寒假倒數"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold ml-1">目標日期時間</Label>
              <Input
                type="datetime-local"
                className="rounded-xl border-primary/10 bg-muted/30"
                value={editingCd?.target_date || ""}
                onChange={(e) =>
                  setEditingCd((prev) => (prev ? { ...prev, target_date: e.target.value } : null))
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold ml-1">開始日期時間（選填）</Label>
              <Input
                type="datetime-local"
                className="rounded-xl border-primary/10 bg-muted/30"
                value={editingCd?.start_date || ""}
                onChange={(e) =>
                  setEditingCd((prev) => (prev ? { ...prev, start_date: e.target.value } : null))
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold ml-1">進度條標籤（選填）</Label>
              <Input
                className="rounded-xl border-primary/10 bg-muted/30"
                value={editingCd?.progress_label || ""}
                onChange={(e) =>
                  setEditingCd((prev) => (prev ? { ...prev, progress_label: e.target.value } : null))
                }
                placeholder="例如：學期進度"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold ml-1">適用年級</Label>
              <Select
                value={editingCd?.grade ?? "all"}
                onValueChange={(value) =>
                  setEditingCd((prev) => (prev ? { ...prev, grade: value } : null))
                }
              >
                <SelectTrigger className="rounded-xl border-primary/10 bg-muted/30">
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
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              className="rounded-xl"
              onClick={() => {
                setCdDialogOpen(false);
                setEditingCd(null);
              }}
            >
              取消
            </Button>
            <Button
              className="rounded-xl bg-primary hover:bg-primary/90 px-8 font-bold"
              onClick={handleSaveCountdown}
            >
              儲存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Announcement Edit Dialog */}
      <Dialog open={annDialogOpen} onOpenChange={setAnnDialogOpen}>
        <DialogContent className="w-[95vw] max-w-lg rounded-3xl border-primary/20 bg-background dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingAnn?.id ? "編輯公告" : "新增公告"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-6 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label className="text-sm font-bold ml-1">標題</Label>
              <Input
                className="rounded-xl border-primary/10 bg-muted/30"
                value={editingAnn?.title || ""}
                onChange={(e) =>
                  setEditingAnn((prev) => (prev ? { ...prev, title: e.target.value } : null))
                }
                placeholder="公告標題"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-bold ml-1">日期</Label>
                <Input
                  type="date"
                  className="rounded-xl border-primary/10 bg-muted/30"
                  value={editingAnn?.date || ""}
                  onChange={(e) =>
                    setEditingAnn((prev) => (prev ? { ...prev, date: e.target.value } : null))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold ml-1">類型</Label>
                <Select
                  value={editingAnn?.type || "info"}
                  onValueChange={(value) =>
                    setEditingAnn((prev) => (prev ? { ...prev, type: value } : null))
                  }
                >
                  <SelectTrigger className="rounded-xl border-primary/10 bg-muted/30">
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
            <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-card p-4">
              <Switch
                checked={editingAnn?.pinned || false}
                onCheckedChange={(checked) =>
                  setEditingAnn((prev) => (prev ? { ...prev, pinned: checked } : null))
                }
              />
              <div>
                <p className="text-sm font-bold">置頂公告</p>
                <p className="text-[10px] text-muted-foreground">置頂公告將顯示在列表最上方</p>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-bold ml-1">自訂圖片（選填）</Label>
              {editingAnn?.image_url && (
                <div className="relative rounded-xl overflow-hidden border border-border/50 aspect-video bg-muted/30">
                  <img src={editingAnn.image_url} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  <button
                    type="button"
                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                    onClick={() => setEditingAnn((prev) => (prev ? { ...prev, image_url: "" } : null))}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl flex-1"
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
                  className="rounded-xl border-primary/10 bg-muted/30 pr-9"
                  value={editingAnn?.image_url || ""}
                  onChange={(e) =>
                    setEditingAnn((prev) => (prev ? { ...prev, image_url: e.target.value } : null))
                  }
                  placeholder="或貼上圖片網址..."
                />
                {editingAnn?.image_url && (
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setEditingAnn((prev) => (prev ? { ...prev, image_url: "" } : null))}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold ml-1">內容（選填）</Label>
              <Textarea
                className="rounded-xl border-primary/10 bg-muted/30 min-h-[120px]"
                value={editingAnn?.content || ""}
                onChange={(e) =>
                  setEditingAnn((prev) => (prev ? { ...prev, content: e.target.value } : null))
                }
                placeholder="公告詳細內容..."
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              className="rounded-xl"
              onClick={() => {
                setAnnDialogOpen(false);
                setEditingAnn(null);
              }}
            >
              取消
            </Button>
            <Button
              className="rounded-xl bg-primary hover:bg-primary/90 px-8 font-bold"
              onClick={handleSaveAnnouncement}
            >
              儲存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialogs */}
      <AlertDialog
        open={!!cdDeleteConfirm}
        onOpenChange={(open) => !open && setCdDeleteConfirm(null)}
      >
        <AlertDialogContent className="rounded-3xl border-primary/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">確認刪除</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              確定要刪除此倒數計時嗎？此操作無法復原。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl border-primary/10">取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cdDeleteConfirm && handleDeleteCountdown(cdDeleteConfirm)}
              className="rounded-xl bg-destructive hover:bg-destructive/90"
            >
              確認刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!annDeleteConfirm}
        onOpenChange={(open) => !open && setAnnDeleteConfirm(null)}
      >
        <AlertDialogContent className="rounded-3xl border-primary/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">確認刪除</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              確定要刪除此公告嗎？此操作無法復原。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl border-primary/10">取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => annDeleteConfirm && handleDeleteAnnouncement(annDeleteConfirm)}
              className="rounded-xl bg-destructive hover:bg-destructive/90"
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
  color,
  badge,
  onClick,
}: {
  icon: typeof Shield;
  title: string;
  description: string;
  color: "blue" | "purple" | "orange" | "green" | "red";
  badge?: string;
  onClick: () => void;
}) {
  const colorMap = {
    blue: "bg-blue-500/10 text-blue-500",
    purple: "bg-purple-500/10 text-purple-500",
    orange: "bg-orange-500/10 text-orange-500",
    green: "bg-green-500/10 text-green-500",
    red: "bg-red-500/10 text-red-500",
  };

  return (
    <button
      onClick={onClick}
      className="group relative flex w-full items-center gap-5 overflow-hidden rounded-[24px] border border-border/50 bg-card p-5 text-left transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
    >
      <div
        className={cn(
          "rounded-2xl p-4 transition-transform group-hover:scale-110",
          colorMap[color]
        )}
      >
        <Icon className="h-7 w-7" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-lg font-black tracking-tight text-foreground">{title}</p>
        <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {badge !== undefined && (
        <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          {badge}
        </span>
      )}
    </button>
  );
}
