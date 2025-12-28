import { useState, useEffect, useRef } from "react";

export interface ComponentSettings {
    id: string;
    label: string;
    enabled: boolean;
    order: number;
}

export interface AppSettings {
    components: ComponentSettings[];
    theme: string;
}

const DEFAULT_COMPONENTS: ComponentSettings[] = [
    { id: "countdown", label: "倒數計時器", enabled: true, order: 0 },
    { id: "weather", label: "天氣資訊", enabled: true, order: 1 },
    { id: "commonSites", label: "常用網站", enabled: true, order: 2 },
    { id: "tools", label: "小工具", enabled: true, order: 3 },
    { id: "honors", label: "榮譽榜", enabled: false, order: 4 },
    { id: "announcements", label: "行政公告", enabled: true, order: 5 },
    { id: "calendar", label: "行事曆", enabled: true, order: 6 },
];

const DEFAULT_SETTINGS: AppSettings = {
    components: DEFAULT_COMPONENTS,
    theme: "light",
};

const STORAGE_KEY = "cmjh-app-settings";
const OLD_COMPONENT_KEY = "cmjh-component-visibility";
const OLD_THEME_KEY = "active-theme";

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
            theme: oldTheme || "light",
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        localStorage.removeItem(OLD_COMPONENT_KEY);
        localStorage.removeItem(OLD_THEME_KEY);

        return newSettings;
    }

    return null;
};

const applyTheme = (value: string) => {
    const root = document.documentElement;
    const body = document.body;
    const themeNames = ["light", "dark", "blue", "green", "orange", "red", "purple", "gradient"];

    [root, body].forEach((el) => {
        el.classList.remove("dark");
        themeNames.forEach((name) => {
            el.classList.remove(`theme-${name}`);
        });
        el.removeAttribute("data-theme");
    });

    if (value === "dark") {
        root.classList.add("dark");
        body.classList.add("dark");
    } else if (value !== "light") {
        const cls = `theme-${value}`;
        root.classList.add(cls);
        body.classList.add(cls);
        root.setAttribute("data-theme", value);
        body.setAttribute("data-theme", value);
    }
};

export function useComponentSettings() {
    const isInitialMount = useRef(true);

    const [settings, setSettings] = useState<AppSettings>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsedSettings = JSON.parse(stored);

                // 遷移邏輯：合併預設組件與已儲存的設定
                const existingComponents = parsedSettings.components || [];
                const existingIds = new Set(existingComponents.map((c: ComponentSettings) => c.id));

                // 找出新增的組件（存在於 DEFAULT_COMPONENTS 但不在已儲存的設定中）
                const newComponents = DEFAULT_COMPONENTS.filter(
                    (c) => !existingIds.has(c.id)
                );

                // 合併組件列表
                const mergedComponents = [...existingComponents, ...newComponents];

                return {
                    ...parsedSettings,
                    components: mergedComponents,
                };
            }
        } catch (error) {
            console.error("Failed to load app settings:", error);
        }

        const migrated = migrateOldSettings();
        if (migrated) {
            return migrated;
        }

        return DEFAULT_SETTINGS;
    });

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            applyTheme(settings.theme);
            return;
        }

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch (error) {
            console.error("Failed to save app settings:", error);
        }
    }, [settings]);

    useEffect(() => {
        applyTheme(settings.theme);
    }, [settings.theme]);

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

    const setTheme = (theme: string) => {
        setSettings((prev) => ({ ...prev, theme }));
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

    return {
        settings,
        toggleComponent,
        moveComponentUp,
        moveComponentDown,
        setTheme,
        resetToDefault,
        showAll,
    };
}
