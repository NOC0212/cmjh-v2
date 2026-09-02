/** 版本管理與 localStorage 儲存鍵 */

// 離線備用版本號
export const FALLBACK_VERSION = "v2.0.0";
const VERSION_STORAGE_KEY = "cmjh-app-version";

export const STORAGE_KEYS = {
  SETTINGS: "cmjh-app-settings",
  COMMON_SITES: "cmjh-common-sites",
  CALENDAR_EVENTS: "cmjh-custom-calendar-events",
  COUNTDOWNS_7: "cmjh-custom-countdowns-7",
  COUNTDOWNS_8: "cmjh-custom-countdowns-8",
  COUNTDOWNS_9: "cmjh-custom-countdowns-9",
  FAVORITES: "favorites",
  READ_ANNOUNCEMENTS: "cmjh-read-announcements",
  MAINTENANCE_WHITELIST: "cmjh-maintenance-whitelist",
} as const;

// ─── 維護白名單：設定後可在維護模式中正常使用 ────────────────────────────────

export function isMaintenanceWhitelisted(): boolean {
  return localStorage.getItem(STORAGE_KEYS.MAINTENANCE_WHITELIST) === "true";
}

export function setMaintenanceWhitelist(enabled: boolean) {
  if (enabled) {
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE_WHITELIST, "true");
  } else {
    localStorage.removeItem(STORAGE_KEYS.MAINTENANCE_WHITELIST);
  }
}

// ─── 管理後台解鎖（設定 > 版本號連點 5 下解鎖導航「管理」入口） ──────────────

const ADMIN_UNLOCK_KEY = "cmjh-admin-unlocked";

export function isAdminUnlocked(): boolean {
  return localStorage.getItem(ADMIN_UNLOCK_KEY) === "true";
}

export function unlockAdmin() {
  localStorage.setItem(ADMIN_UNLOCK_KEY, "true");
}

// ─── 首次體驗檢查 ──────────────────────────────────────────────────────────────

const SETUP_STORAGE_KEY = "cmjh-first-setup-completed";

/** 首次體驗是否已完成 */
export function checkFirstTimeSetup(): boolean {
  return localStorage.getItem(SETUP_STORAGE_KEY) === "true";
}

/** 標記首次體驗已完成 */
export function markFirstTimeSetupCompleted() {
  localStorage.setItem(SETUP_STORAGE_KEY, "true");
}

// ─── 版本號 ──────────────────────────────────────────────────────────────────

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

/** 資料遷移（版本變更時驗證 localStorage 完整性） */
export function migrateData(targetVersion?: string) {
  const target = targetVersion || FALLBACK_VERSION;
  const current = getCurrentVersion();

  if (!current) {
    localStorage.setItem(VERSION_STORAGE_KEY, target);
    return;
  }

  if (current === target) return;

  console.log(`[AutoUpdate] 正在從 ${current} 遷移至 ${target}...`);

  Object.values(STORAGE_KEYS).forEach((storageKey) => {
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

// ─── 資料匯出 / 匯入 ─────────────────────────────────────────────────────────

/** 匯出使用者資料為 JSON */
export function exportUserData() {
  const data: Record<string, unknown> = {};
  Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
    const value = localStorage.getItem(storageKey);
    if (value) {
      try {
        data[key] = JSON.parse(value);
      } catch {
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

/** 匯入使用者資料 */
export function importUserData(jsonData: Record<string, unknown>) {
  Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
    if (jsonData[key]) {
      const value = typeof jsonData[key] === "string" ? jsonData[key] : JSON.stringify(jsonData[key]);
      localStorage.setItem(storageKey, value);
    }
  });
}
