import { useState, useEffect, useRef } from "react";

export interface ComponentVisibility {
    countdown: boolean;
    weather: boolean;
    commonSites: boolean;
    announcements: boolean;
    calendar: boolean;
}

const DEFAULT_VISIBILITY: ComponentVisibility = {
    countdown: true,
    weather: true,
    commonSites: true,
    announcements: true,
    calendar: true,
};

const STORAGE_KEY = "cmjh-component-visibility";

export function useComponentSettings() {
    const isInitialMount = useRef(true);

    const [visibility, setVisibility] = useState<ComponentVisibility>(() => {
        // 從 localStorage 讀取設定
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return { ...DEFAULT_VISIBILITY, ...JSON.parse(stored) };
            }
        } catch (error) {
            console.error("Failed to load component settings:", error);
        }
        return DEFAULT_VISIBILITY;
    });

    // 當設定改變時，保存到 localStorage (但跳過初始載入)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(visibility));
        } catch (error) {
            console.error("Failed to save component settings:", error);
        }
    }, [visibility]);

    const updateVisibility = (key: keyof ComponentVisibility, value: boolean) => {
        setVisibility((prev) => ({ ...prev, [key]: value }));
    };

    const resetToDefault = () => {
        setVisibility(DEFAULT_VISIBILITY);
    };

    const showAll = () => {
        setVisibility(DEFAULT_VISIBILITY);
    };

    return {
        visibility,
        updateVisibility,
        resetToDefault,
        showAll,
    };
}
