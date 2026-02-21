import React, { createContext, useContext, useState, useEffect, useMemo } from "react";

export interface ComponentSettings {
    id: string;
    label: string;
    enabled: boolean;
    order: number;
}

export interface AppSettings {
    components: ComponentSettings[];
    themeMode: "light" | "dark" | "system";
    themeColor: string;
    disableUpdatePrompt: boolean;
    showLatestAnnouncementOnStartup: boolean;
}

interface SettingsContextType {
    settings: AppSettings;
    toggleComponent: (id: string) => void;
    moveComponentUp: (id: string) => void;
    moveComponentDown: (id: string) => void;
    setTheme: (themeColor: string) => void;
    setThemeMode: (themeMode: "light" | "dark" | "system") => void;
    setThemeColor: (themeColor: string) => void;
    setDisableUpdatePrompt: (disabled: boolean) => void;
    setShowLatestAnnouncementOnStartup: (show: boolean) => void;
    resetToDefault: () => void;
    showAll: () => void;
    reorderComponents: (newComponents: ComponentSettings[]) => void;
}

const DEFAULT_COMPONENTS: ComponentSettings[] = [
    { id: "countdown", label: "倒數計時器", enabled: true, order: 0 },
    { id: "weather", label: "天氣資訊", enabled: true, order: 1 },
    { id: "commonSites", label: "常用網站", enabled: true, order: 2 },
    { id: "tools", label: "小工具", enabled: true, order: 3 },
    { id: "honors", label: "榮譽榜", enabled: false, order: 4 },
    { id: "announcements", label: "行政公告", enabled: true, order: 5 },
    { id: "lunch", label: "營養午餐", enabled: false, order: 6 },
    { id: "calendar", label: "行事曆", enabled: true, order: 7 },
];

const DEFAULT_SETTINGS: AppSettings = {
    components: DEFAULT_COMPONENTS,
    themeMode: "system",
    themeColor: "blue",
    disableUpdatePrompt: false,
    showLatestAnnouncementOnStartup: true,
};

const STORAGE_KEY = "cmjh-app-settings";
const OLD_COMPONENT_KEY = "cmjh-component-visibility";
const OLD_THEME_KEY = "active-theme";

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const migrateOldSettings = (): AppSettings | null => {
    const oldVisibility = localStorage.getItem(OLD_COMPONENT_KEY);
    const oldTheme = localStorage.getItem(OLD_THEME_KEY);

    if (oldVisibility || oldTheme) {
        let components = [...DEFAULT_COMPONENTS];

        if (oldVisibility) {
            try {
                const visibility = JSON.parse(oldVisibility);
                components = DEFAULT_COMPONENTS.map((comp) => ({
                    ...comp,
                    enabled: visibility[comp.id] ?? true,
                }));
            } catch (error) {
                console.error("Failed to migrate old component settings:", error);
            }
        }

        const newSettings: AppSettings = {
            components,
            themeMode: (oldTheme === "dark" ? "dark" : "light") as any,
            themeColor: (oldTheme && oldTheme !== "dark" && oldTheme !== "light" ? oldTheme : "blue"),
            disableUpdatePrompt: false,
            showLatestAnnouncementOnStartup: true,
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        localStorage.removeItem(OLD_COMPONENT_KEY);
        localStorage.removeItem(OLD_THEME_KEY);

        return newSettings;
    }

    return null;
};

const applyTheme = (mode: "light" | "dark" | "system", color: string) => {
    const root = document.documentElement;
    const body = document.body;

    // 清除舊的模式
    root.classList.remove("dark", "light");
    body.classList.remove("dark", "light");

    // 清除舊的主題顏色 class
    const themeColorClasses = Array.from(root.classList).filter(cls => cls.startsWith("theme-"));
    themeColorClasses.forEach(cls => {
        root.classList.remove(cls);
        body.classList.remove(cls);
    });

    // 確定實際模式
    let actualMode = mode;
    if (mode === "system") {
        actualMode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    // 套用模式
    root.classList.add(actualMode);
    body.classList.add(actualMode);
    root.dataset.mode = actualMode;

    // 套用顏色
    const colorClass = `theme-${color}`;
    root.classList.add(colorClass);
    body.classList.add(colorClass);
    root.dataset.theme = color;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const [settings, setSettings] = useState<AppSettings>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsedSettings = JSON.parse(stored);

                // 修正舊版 schema 沒有 themeMode 的問題
                if (!parsedSettings.themeMode) {
                    parsedSettings.themeMode = parsedSettings.theme === "dark" ? "dark" : "system";
                    parsedSettings.themeColor = (parsedSettings.theme && parsedSettings.theme !== "dark" && parsedSettings.theme !== "light")
                        ? parsedSettings.theme
                        : "blue";
                    delete parsedSettings.theme;
                }

                // 處理剛才過渡期的 showUpdatePrompt 回到 disableUpdatePrompt 的遷移
                let disableUpdatePrompt = parsedSettings.disableUpdatePrompt;
                if (disableUpdatePrompt === undefined && parsedSettings.showUpdatePrompt !== undefined) {
                    disableUpdatePrompt = !parsedSettings.showUpdatePrompt;
                }

                const existingComponents = parsedSettings.components || [];
                const existingIds = new Set(existingComponents.map((c: ComponentSettings) => c.id));
                const newComponents = DEFAULT_COMPONENTS.filter((c) => !existingIds.has(c.id));
                const mergedComponents = [...existingComponents, ...newComponents];

                return {
                    ...parsedSettings,
                    components: mergedComponents,
                    disableUpdatePrompt: disableUpdatePrompt ?? false,
                    showLatestAnnouncementOnStartup: parsedSettings.showLatestAnnouncementOnStartup ?? true,
                };
            }
        } catch (error) {
            console.error("Failed to load app settings:", error);
        }

        const migrated = migrateOldSettings();
        if (migrated) return migrated;

        return DEFAULT_SETTINGS;
    });

    // 監聽系統主題切換
    useEffect(() => {
        if (settings.themeMode !== "system") return;

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => applyTheme("system", settings.themeColor);

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [settings.themeMode, settings.themeColor]);

    useEffect(() => {
        applyTheme(settings.themeMode, settings.themeColor);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    const toggleComponent = (id: string) => {
        setSettings((prev) => ({
            ...prev,
            components: prev.components.map((comp) =>
                comp.id === id ? { ...comp, enabled: !comp.enabled } : comp
            ),
        }));
    };

    const moveComponentUp = (id: string) => {
        setSettings((prev) => {
            const components = [...prev.components];
            const enabledComponents = components.filter((c) => c.enabled).sort((a, b) => a.order - b.order);
            const index = enabledComponents.findIndex((c) => c.id === id);
            if (index <= 0) return prev;
            const temp = enabledComponents[index].order;
            enabledComponents[index].order = enabledComponents[index - 1].order;
            enabledComponents[index - 1].order = temp;
            const updatedComponents = components.map((comp) => {
                const found = enabledComponents.find((ec) => ec.id === comp.id);
                return found || comp;
            });
            return { ...prev, components: updatedComponents };
        });
    };

    const moveComponentDown = (id: string) => {
        setSettings((prev) => {
            const components = [...prev.components];
            const enabledComponents = components.filter((c) => c.enabled).sort((a, b) => a.order - b.order);
            const index = enabledComponents.findIndex((c) => c.id === id);
            if (index < 0 || index >= enabledComponents.length - 1) return prev;
            const temp = enabledComponents[index].order;
            enabledComponents[index].order = enabledComponents[index + 1].order;
            enabledComponents[index + 1].order = temp;
            const updatedComponents = components.map((comp) => {
                const found = enabledComponents.find((ec) => ec.id === comp.id);
                return found || comp;
            });
            return { ...prev, components: updatedComponents };
        });
    };

    const setThemeMode = (themeMode: "light" | "dark" | "system") => {
        setSettings((prev) => ({ ...prev, themeMode }));
    };

    const setThemeColor = (themeColor: string) => {
        setSettings((prev) => ({ ...prev, themeColor }));
    };

    const setDisableUpdatePrompt = (disableUpdatePrompt: boolean) => {
        setSettings((prev) => ({ ...prev, disableUpdatePrompt }));
    };

    const setShowLatestAnnouncementOnStartup = (showLatestAnnouncementOnStartup: boolean) => {
        setSettings((prev) => ({ ...prev, showLatestAnnouncementOnStartup }));
    };

    const resetToDefault = () => {
        setSettings(DEFAULT_SETTINGS);
    };

    const showAll = () => {
        setSettings((prev) => ({
            ...prev,
            components: prev.components.map((comp) => ({ ...comp, enabled: true })),
        }));
    };

    const reorderComponents = (newComponents: ComponentSettings[]) => {
        setSettings((prev) => {
            // 更新順序
            const updated = newComponents.map((c, i) => ({ ...c, order: i }));

            // 與原本未顯示或禁用的組合
            const currentIds = new Set(updated.map(c => c.id));
            const otherComponents = prev.components.filter(c => !currentIds.has(c.id));

            return {
                ...prev,
                components: [...updated, ...otherComponents]
            };
        });
    };

    const value = useMemo(() => ({
        settings,
        toggleComponent,
        moveComponentUp,
        moveComponentDown,
        setTheme: setThemeColor,
        setThemeMode,
        setThemeColor,
        setDisableUpdatePrompt,
        setShowLatestAnnouncementOnStartup,
        resetToDefault,
        showAll,
        reorderComponents
    }), [settings]);

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
};
