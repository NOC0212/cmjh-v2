export const LATEST_VERSION = "v1.5.0 x0330";
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

export function migrateData() {
    const current = getCurrentVersion();
    
    // 如果沒有版本號，代表是極舊版本或新安裝，先確保基礎版本
    if (!current) {
        localStorage.setItem(VERSION_STORAGE_KEY, "v1.2.3");
        return;
    }

    if (current === LATEST_VERSION) return;

    console.log(`正在從 ${current} 遷移至 ${LATEST_VERSION}...`);

    // 在此加入特定版本的遷移邏輯（範例）
    // if (current < "v1.5.0") { ... }

    // 通用檢查：確保所有存儲的 JSON 格式正確，避免組件崩潰
    Object.values(STORAGE_KEYS).forEach(storageKey => {
        const val = localStorage.getItem(storageKey);
        if (val) {
            try {
                // 嘗試解析，如果失敗則可能需要處理
                const parsed = JSON.parse(val);
                
                // 針對特定組件的資料補齊 (例如 Countdown 計時器如果少了某個欄位)
                if (storageKey === STORAGE_KEYS.COUNTDOWNS && Array.isArray(parsed)) {
                    // 確保每個計時器都有必要的欄位，防止舊資料導致新版組件出錯
                    // parsed.forEach(item => { if (!item.color) item.color = 'primary'; });
                    // localStorage.setItem(storageKey, JSON.stringify(parsed));
                }
            } catch (e) {
                console.error(`資料損壞或格式不符: ${storageKey}`, e);
                // 這裡可以選擇不處理，或者重置損壞的欄位
            }
        }
    });

    updateVersionToLatest();
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
