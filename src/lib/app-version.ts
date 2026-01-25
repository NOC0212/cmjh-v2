export const LATEST_VERSION = "v1.3.5";
const VERSION_STORAGE_KEY = "cmjh-app-version";

export const STORAGE_KEYS = {
    SETTINGS: "cmjh-app-settings",
    COMMON_SITES: "cmjh-common-sites",
    CALENDAR_EVENTS: "cmjh-custom-calendar-events",
    COUNTDOWNS: "cmjh-custom-countdowns",
    FAVORITES: "favorites",
    SETUP_COMPLETED: "cmjh-first-setup-completed",
    SCRATCHPAD: "cmjh_scratchpad_notes",
};

export function getCurrentVersion(): string {
    return localStorage.getItem(VERSION_STORAGE_KEY) || "";
}

export function ensureVersion() {
    const current = getCurrentVersion();
    if (!current) {
        localStorage.setItem(VERSION_STORAGE_KEY, "v1.2.3");
    }
}

export function updateVersionToLatest() {
    localStorage.setItem(VERSION_STORAGE_KEY, LATEST_VERSION);
}

export function exportUserData() {
    const data: Record<string, any> = {};
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
        const value = localStorage.getItem(storageKey);
        if (value) {
            try {
                data[key] = JSON.parse(value);
            } catch (e) {
                data[key] = value;
            }
        }
    });

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cmjh-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function importUserData(jsonData: any) {
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
        if (jsonData[key]) {
            const value = typeof jsonData[key] === "string" ? jsonData[key] : JSON.stringify(jsonData[key]);
            localStorage.setItem(storageKey, value);
        }
    });
}
