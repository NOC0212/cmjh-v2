// 離線備用版本號 — 僅在 Supabase 未設定或尚未載入時使用
// 正式版本號請在管理後台 > 版本管理中設定
export const FALLBACK_VERSION = "v1.5.4";
const VERSION_STORAGE_KEY = "cmjh-app-version";

export const STORAGE_KEYS = {
    SETTINGS: "cmjh-app-settings",
    COMMON_SITES: "cmjh-common-sites",
    CALENDAR_EVENTS: "cmjh-custom-calendar-events",
    COUNTDOWNS: "cmjh-custom-countdowns",
    FAVORITES: "favorites",
    SETUP_COMPLETED: "cmjh-first-setup-completed",
    SCRATCHPAD: "cmjh_scratchpad_notes",
    READ_ANNOUNCEMENTS: "cmjh-read-announcements",
    MAINTENANCE_WHITELIST: "cmjh-maintenance-whitelist",
};

// 維護白名單：設定後可在維護模式中正常使用
const MAINTENANCE_WHITELIST_KEY = STORAGE_KEYS.MAINTENANCE_WHITELIST;

export function isMaintenanceWhitelisted(): boolean {
  return localStorage.getItem(MAINTENANCE_WHITELIST_KEY) === "true";
}

export function setMaintenanceWhitelist(enabled: boolean) {
  if (enabled) {
    localStorage.setItem(MAINTENANCE_WHITELIST_KEY, "true");
  } else {
    localStorage.removeItem(MAINTENANCE_WHITELIST_KEY);
  }
}

// 管理後台解鎖狀態（設定 > 系統資料 > 版本箭頭點 5 下解鎖）
const ADMIN_UNLOCK_KEY = "cmjh-admin-unlocked";

export function isAdminUnlocked(): boolean {
  return localStorage.getItem(ADMIN_UNLOCK_KEY) === "true";
}

export function unlockAdmin() {
  localStorage.setItem(ADMIN_UNLOCK_KEY, "true");
}

export function getCurrentVersion(): string {
    return localStorage.getItem(VERSION_STORAGE_KEY) || "";
}

export function ensureVersion(targetVersion?: string) {
    const current = getCurrentVersion();
    if (!current) {
        localStorage.setItem(VERSION_STORAGE_KEY, targetVersion || FALLBACK_VERSION);
    }
}

export function updateVersionToLatest(targetVersion?: string) {
    localStorage.setItem(VERSION_STORAGE_KEY, targetVersion || FALLBACK_VERSION);
}

export function migrateData(targetVersion?: string) {
    const target = targetVersion || FALLBACK_VERSION;
    const current = getCurrentVersion();
    
    // 如果沒有版本號，代表是極舊版本或新安裝，先確保基礎版本
    if (!current) {
        localStorage.setItem(VERSION_STORAGE_KEY, target);
        return;
    }

    if (current === target) return;

    console.log(`正在從 ${current} 遷移至 ${target}...`);

    // 在此加入特定版本的遷移邏輯（範例）
    // if (current < "v1.5.0") { ... }

    // 每次更新版本時，自動清除已讀公告記錄
    localStorage.removeItem(STORAGE_KEYS.READ_ANNOUNCEMENTS);

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

    updateVersionToLatest(target);
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
