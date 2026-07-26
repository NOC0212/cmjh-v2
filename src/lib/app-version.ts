// 離線備用版本號 — 僅在 Supabase 未設定或尚未載入時使用
// 正式版本號請在管理後台 > 版本管理中設定
export const FALLBACK_VERSION = "v1.5.4";
const VERSION_STORAGE_KEY = "cmjh-app-version";

export const STORAGE_KEYS = {
    SETTINGS: "cmjh-app-settings",
    COMMON_SITES: "cmjh-common-sites",
    CALENDAR_EVENTS: "cmjh-custom-calendar-events",
    COUNTDOWNS_7: "cmjh-custom-countdowns-7",
    COUNTDOWNS_8: "cmjh-custom-countdowns-8",
    COUNTDOWNS_9: "cmjh-custom-countdowns-9",
    FAVORITES: "favorites",
    SETUP_COMPLETED: "cmjh-first-setup-completed",
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

function setVersion(targetVersion?: string, force = false) {
    const current = getCurrentVersion();
    if (force || !current) {
        localStorage.setItem(VERSION_STORAGE_KEY, targetVersion || FALLBACK_VERSION);
    }
}

export function ensureVersion(targetVersion?: string) {
    setVersion(targetVersion, false);
}

export function updateVersionToLatest(targetVersion?: string) {
    setVersion(targetVersion, true);
}

/**
 * 資料遷移：版本變更時執行下列操作
 * - 更新 localStorage 中的版本號
 * - 檢查所有 localStorage JSON 資料完整性
 * - 保持已閱讀公告記錄不變
 */
export function migrateData(targetVersion?: string) {
    const target = targetVersion || FALLBACK_VERSION;
    const current = getCurrentVersion();
    
    // 如果沒有版本號，代表是極舊版本或新安裝，先確保基礎版本
    if (!current) {
        localStorage.setItem(VERSION_STORAGE_KEY, target);
        return;
    }

    if (current === target) return;

    console.log(`[AutoUpdate] 正在從 ${current} 遷移至 ${target}...`);

    // 通用檢查：確保所有存儲的 JSON 格式正確，避免組件崩潰
    Object.values(STORAGE_KEYS).forEach(storageKey => {
        const val = localStorage.getItem(storageKey);
        if (val) {
            try {
                JSON.parse(val); // 僅驗證格式正確性
            } catch (e) {
                console.error(`[AutoUpdate] 資料損壞: ${storageKey}`, e);
            }
        }
    });

    updateVersionToLatest(target);
}

/**
 * 匯出使用者資料（settings + 自訂資料）為 JSON 檔案
 */
export function exportUserData() {
    const data: Record<string, unknown> = {};
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

/**
 * 匯入使用者資料
 */
export function importUserData(jsonData: Record<string, unknown>) {
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
        if (jsonData[key]) {
            const value = typeof jsonData[key] === "string" ? jsonData[key] : JSON.stringify(jsonData[key]);
            localStorage.setItem(storageKey, value);
        }
    });
}
