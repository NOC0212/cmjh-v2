import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { STORAGE_KEYS, exportUserData, importUserData } from "@/lib/app-version";

/** 應用設定（瘦身版） */

export interface ComponentSettings {
  id: string;
  label: string;
  enabled: boolean;
  order: number;
}

export type ThemeMode = "light" | "dark" | "system";

/** 品牌色相（0-360） */
export const DEFAULT_HUE = 191;

export interface AppSettings {
  components: ComponentSettings[];
  themeMode: ThemeMode;
  themeHue: number;
  showLatestAnnouncementOnStartup: boolean;
  showSiteFavicons: boolean;
  disableDefaultCountdowns: boolean;
}

interface SettingsContextValue {
  settings: AppSettings;
  setThemeMode: (mode: ThemeMode) => void;
  setThemeHue: (hue: number) => void;
  setShowLatestAnnouncementOnStartup: (show: boolean) => void;
  setShowSiteFavicons: (show: boolean) => void;
  setDisableDefaultCountdowns: (disabled: boolean) => void;
  updateSettings: (partial: Partial<AppSettings>) => void;
  resetToDefault: () => void;
  exportData: () => void;
  importData: (json: Record<string, unknown>) => void;
}

export const DEFAULT_COMPONENTS: ComponentSettings[] = [
  { id: "countdown", label: "倒數計時器", enabled: true, order: 0 },
  { id: "weather", label: "天氣資訊", enabled: true, order: 1 },
  { id: "commonSites", label: "常用網站", enabled: true, order: 2 },
  { id: "honors", label: "榮譽榜", enabled: false, order: 4 },
  { id: "lunch", label: "營養午餐", enabled: true, order: 5 },
  { id: "calendar", label: "行事曆", enabled: true, order: 7 },
];

export const DEFAULT_SETTINGS: AppSettings = {
  components: DEFAULT_COMPONENTS,
  themeMode: "system",
  themeHue: DEFAULT_HUE,
  showLatestAnnouncementOnStartup: true,
  showSiteFavicons: false,
  disableDefaultCountdowns: false,
};

const STORAGE_KEY = STORAGE_KEYS.SETTINGS;

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

/** 套用淺色/深色模式 */
function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;

  let actualMode: "light" | "dark";
  if (mode === "system") {
    actualMode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } else {
    actualMode = mode;
  }

  root.classList.remove("dark", "light");
  root.classList.add(actualMode);
  root.dataset.mode = actualMode;
}

function normalizeComponents(stored: unknown): ComponentSettings[] {
  const existing = Array.isArray(stored) ? (stored as ComponentSettings[]) : [];
  const existingIds = new Set(existing.map((c) => c.id));
  const missing = DEFAULT_COMPONENTS.filter((c) => !existingIds.has(c.id));
  const merged = [...existing, ...missing];

  // 安全檢查：全部關閉時重設為預設啟用
  if (merged.length > 0 && !merged.some((c) => c.enabled)) {
    return merged.map((c) => ({ ...c, enabled: true }));
  }
  return merged;
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AppSettings>;
        return {
          components: normalizeComponents(parsed.components),
          themeMode: parsed.themeMode ?? "system",
          themeHue: parsed.themeHue ?? DEFAULT_HUE,
          showLatestAnnouncementOnStartup: parsed.showLatestAnnouncementOnStartup ?? true,
          showSiteFavicons: parsed.showSiteFavicons ?? false,
          disableDefaultCountdowns: parsed.disableDefaultCountdowns ?? false,
        };
      }
    } catch (error) {
      console.error("Failed to load app settings:", error);
    }
    return DEFAULT_SETTINGS;
  });

  // 跟隨系統主題切換
  useEffect(() => {
    if (settings.themeMode !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme("system");
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [settings.themeMode]);

  useEffect(() => {
    applyTheme(settings.themeMode);
    document.documentElement.style.setProperty("--hue", String(settings.themeHue));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save app settings:", error);
    }
  }, [settings]);

  const setThemeMode = (themeMode: ThemeMode) => {
    setSettings((prev) => ({ ...prev, themeMode }));
  };

  const setThemeHue = (themeHue: number) => {
    setSettings((prev) => ({ ...prev, themeHue }));
  };

  const setShowLatestAnnouncementOnStartup = (showLatestAnnouncementOnStartup: boolean) => {
    setSettings((prev) => ({ ...prev, showLatestAnnouncementOnStartup }));
  };

  const setShowSiteFavicons = (showSiteFavicons: boolean) => {
    setSettings((prev) => ({ ...prev, showSiteFavicons }));
  };

  const setDisableDefaultCountdowns = (disableDefaultCountdowns: boolean) => {
    setSettings((prev) => ({ ...prev, disableDefaultCountdowns }));
  };

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const resetToDefault = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const exportData = () => exportUserData();

  const importData = (json: Record<string, unknown>) => {
    importUserData(json);
    window.location.reload();
  };

  const value = useMemo(
    () => ({
      settings,
      setThemeMode,
      setThemeHue,
      setShowLatestAnnouncementOnStartup,
      setShowSiteFavicons,
      setDisableDefaultCountdowns,
      updateSettings,
      resetToDefault,
      exportData,
      importData,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
