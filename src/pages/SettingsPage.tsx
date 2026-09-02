import { useRef, useState } from "react";
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  RefreshCw,
  Download,
  Upload,
  Zap,
  HardDrive,
  Palette,
  Check,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  useSettings,
  type ThemeMode,
  DEFAULT_HUE,
} from "@/hooks/settings-context";
import { useToast } from "@/components/ui/toast";
import { useSiteConfig } from "@/hooks/use-site-config";
import { useAutoUpdate } from "@/hooks/use-auto-update";
import {
  getCurrentVersion,
  FALLBACK_VERSION,
  exportUserData,
  importUserData,
} from "@/lib/app-version";
import { cn } from "@/lib/utils";

/** 設定頁 */

const MODES: { name: string; value: ThemeMode; icon: typeof Sun }[] = [
  { name: "淺色", value: "light", icon: Sun },
  { name: "深色", value: "dark", icon: Moon },
  { name: "跟隨系統", value: "system", icon: Monitor },
];

export default function SettingsPage() {
  const {
    settings,
    setThemeMode,
    setThemeHue,
    setShowLatestAnnouncementOnStartup,
    setShowSiteFavicons,
    setDisableDefaultCountdowns,
    resetToDefault,
  } = useSettings();

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isResetConfirming, setIsResetConfirming] = useState(false);

  const { appVersion } = useSiteConfig();
  const { checkForUpdates } = useAutoUpdate();
  const latestVersionFromServer = appVersion?.latestVersion || FALLBACK_VERSION;
  const currentVersion = getCurrentVersion();
  const isLatestVersion = currentVersion === latestVersionFromServer;

  const handleReset = () => {
    resetToDefault();
    setIsResetConfirming(false);
    toast({ title: "已重置", description: "設定已恢復預設值" });
  };

  const handleCheckUpdate = () => {
    checkForUpdates();
    toast({ title: "正在檢查更新", description: "已在背景檢查最新版本與資料" });
  };

  const handleExport = () => {
    exportUserData();
    toast({ title: "匯出成功", description: "使用者資料已匯出" });
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        importUserData(json);
        toast({ title: "匯入成功", description: "資料已匯入，稍後將重新整理頁面" });
        setTimeout(() => window.location.reload(), 1200);
      } catch {
        toast({ title: "匯入失敗", description: "檔案格式不正確", variant: "destructive" });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 pb-8 text-foreground opacity-0 animate-fade-in">
      {/* 頁面標題列 */}
      <div className="flex items-center gap-3">
        <span className="section-icon">
          <Settings className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-foreground">設定</h2>
          <p className="text-xs text-muted-foreground">調整首頁內容、外觀與個人偏好</p>
        </div>
      </div>

      <Separator />

      {/* ② 外觀 */}
      <section className="space-y-4 animate-stagger-2">
        <SectionHeader icon={Palette} title="外觀" hint="修改後會立即套用" />
        <div className="grid grid-cols-3 gap-3">
          {MODES.map((mode) => {
            const Icon = mode.icon;
            const isActive = settings.themeMode === mode.value;
            return (
              <button
                key={mode.value}
                onClick={() => setThemeMode(mode.value)}
                className={cn(
                  "relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                  "hover:border-primary/50",
                  isActive
                    ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                    : "border-border/50 bg-background/60 hover:bg-muted/30"
                )}
              >
                <div className={cn("rounded-lg p-1.5 transition-colors", isActive ? "text-primary" : "text-muted-foreground")}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={cn("text-xs font-semibold", isActive ? "text-primary" : "text-muted-foreground")}>
                  {mode.name}
                </span>
                {isActive && <Check className="absolute right-1.5 top-1.5 h-3.5 w-3.5 text-primary" />}
              </button>
            );
          })}
        </div>

        {/* 主題色（Hue）滑桿 */}
        <div className="rounded-xl border border-border/40 bg-card/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">主題色</span>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-muted px-2.5 py-1 text-sm font-bold tabular-nums">
                {settings.themeHue}°
              </span>
              {settings.themeHue !== DEFAULT_HUE && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
                  onClick={() => setThemeHue(DEFAULT_HUE)}
                  title="重設為預設色相"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  重設
                </Button>
              )}
            </div>
          </div>
          <div className="hue-track h-6 rounded-full px-1 flex items-center">
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={settings.themeHue}
              onChange={(e) => setThemeHue(Number(e.target.value))}
              aria-label="主題色相"
              className="hue-slider w-full"
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>調整品牌主色，即時預覽</span>
            <span
              className="inline-flex items-center gap-1.5"
            >
              <span className="h-3.5 w-3.5 rounded-full border border-border" style={{ background: `hsl(${settings.themeHue} 70% 35%)` }} />
              預覽
            </span>
          </div>
        </div>
      </section>

      <Separator />

      {/* ③ 偏好設定 */}
      <section className="space-y-4 animate-stagger-3">
        <SectionHeader icon={Zap} title="偏好設定" hint="調整啟動行為與常用介面細節" />
        <div className="space-y-1">
          <PrefOption
            id="preference-announcement"
            label="啟動顯示公告"
            desc="登入首頁後自動展開 7 天內最新快訊"
            checked={settings.showLatestAnnouncementOnStartup}
            onChange={(value: boolean) => setShowLatestAnnouncementOnStartup(!!value)}
          />
          <PrefOption
            id="preference-favicon"
            label="顯示網站圖示"
            desc="常用網站卡片顯示 favicon"
            checked={settings.showSiteFavicons}
            onChange={(value: boolean) => setShowSiteFavicons(!!value)}
          />
          <PrefOption
            id="preference-default-countdowns"
            label="啟用預設倒數"
            desc="關閉後只顯示自訂的倒數計時，不載入學校預設倒數"
            checked={!settings.disableDefaultCountdowns}
            onChange={(value: boolean) => setDisableDefaultCountdowns(!value)}
          />
        </div>
      </section>

      <Separator />

      {/* ④ 系統資料 */}
      <section className="space-y-4 animate-stagger-4">
        <SectionHeader icon={HardDrive} title="系統資料" hint="版本資訊與資料匯入匯出" />

        {/* 版本資訊 */}
        <div className="relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-card to-muted/30 p-6 shadow-sm">
          <div className="absolute -right-6 -top-6 opacity-[3%]">
            <RefreshCw className="h-32 w-32" />
          </div>
          <div className="relative space-y-5">
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">版本資訊</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-border/30 bg-background/60 p-4">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">目前版本</p>
                <p className="font-mono text-lg font-bold">{currentVersion || FALLBACK_VERSION}</p>
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-4">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-primary">最新版本</p>
                <p className="font-mono text-lg font-bold">{latestVersionFromServer}</p>
              </div>
            </div>
            <Button size="default" variant="outline" onClick={handleCheckUpdate} className="h-11 w-full text-sm font-semibold">
              檢查更新
            </Button>
            <p className="text-center text-[11px] text-muted-foreground/60">
              {isLatestVersion ? "✓ 版本已在背景自動同步" : "版本檢查中..."}
            </p>
          </div>
        </div>

        {/* 資料管理 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-muted-foreground/40" />
            <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">資料管理</h4>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Button
              variant="outline"
              className="flex h-20 items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/40 transition-all hover:border-primary/40 hover:bg-muted/30"
              onClick={handleExport}
            >
              <Download className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold">匯出資料</span>
            </Button>
            <Button
              variant="outline"
              className="flex h-20 items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/40 transition-all hover:border-primary/40 hover:bg-muted/30"
              onClick={handleImportClick}
            >
              <Upload className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold">匯入資料</span>
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
          </div>
        </div>

        {/* 重置所有設定 */}
        <div className="flex flex-col items-center gap-4 pt-2">
          <AnimatePresence mode="wait">
            {!isResetConfirming ? (
              <motion.div key="reset-idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsResetConfirming(true)}
                  className="h-10 rounded-full px-6 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
                >
                  <RefreshCw className="mr-2 h-3 w-3" />
                  重置所有設定
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="reset-confirm"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.1, ease: "easeOut" }}
                className="flex flex-col items-center gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-6"
              >
                <p className="text-sm font-bold text-destructive">確定要重置所有設定嗎？</p>
                <p className="text-xs text-muted-foreground">這會清除目前設定並恢復預設值。</p>
                <div className="flex w-full gap-3">
                  <Button variant="destructive" size="sm" onClick={handleReset} className="flex-1">
                    重置
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsResetConfirming(false)} className="flex-1">
                    取消
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

/* ===== 區塊標題 ===== */

function SectionHeader({
  icon: Icon,
  title,
  hint,
}: {
  icon: typeof Settings;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="section-icon">
        <Icon className="h-4 w-4" />
      </span>
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
    </div>
  );
}

/* ===== ③ 偏好設定列 ===== */

function PrefOption({
  id,
  label,
  desc,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  desc: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/30 bg-background/60 p-4 transition-all hover:bg-muted/20">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="cursor-pointer text-sm font-semibold text-foreground">
          {label}
        </Label>
        <p className="text-[11px] text-muted-foreground/80">{desc}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
