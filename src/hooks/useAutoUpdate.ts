import { useEffect, useRef, useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, SUPABASE_ENABLED } from "@/lib/supabase";
import {
  getCurrentVersion,
  updateVersionToLatest,
  migrateData,
} from "@/lib/app-version";

interface AppVersionConfig {
  latestVersion: string;
  releaseHighlights: string[];
}

export interface UpdateInfo {
  fromVersion: string;
  toVersion: string;
  highlights: string[];
}

/**
 * 中央背景自動更新系統
 *
 * 功能：
 * 1. 每 5 分鐘檢查 Supabase 最新版本號
 * 2. 版本變更時自動執行 migrateData + 更新 localStorage 版本
 * 3. 版本變更時 invalidate 所有 TanStack Query 資料查詢（強制重新擷取 JSON）
 * 4. 顯示更新彈窗讓使用者手動關閉（取代原本 toast）
 */
async function fetchLatestVersion(): Promise<AppVersionConfig | null> {
  if (!SUPABASE_ENABLED) return null;

  const { data, error } = await supabase
    .from("site_config")
    .select("app_version")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("[AutoUpdate] Failed to fetch version:", error);
    return null;
  }

  const av = (data as { app_version: AppVersionConfig }).app_version;
  if (av && Object.keys(av).length > 0) {
    return av;
  }
  return null;
}

export function useAutoUpdate() {
  const queryClient = useQueryClient();
  const migratingRef = useRef(false);
  
  // 更新彈窗狀態
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);

  // 定期檢查伺服器版本（5 分鐘）
  const { data: serverVersion } = useQuery({
    queryKey: ["autoUpdate", "latestVersion"],
    queryFn: fetchLatestVersion,
    staleTime: 1000 * 60 * 5, // 5 分鐘
    refetchInterval: 1000 * 60 * 5, // 每 5 分鐘背景輪詢
    enabled: SUPABASE_ENABLED,
  });

  // 版本變更時自動遷移
  useEffect(() => {
    if (!serverVersion?.latestVersion) return;
    if (migratingRef.current) return;

    const currentVersion = getCurrentVersion();
    const latestVersion = serverVersion.latestVersion;
    const highlights = serverVersion.releaseHighlights || [];

    // 首次使用或版本不同時自動遷移
    if (!currentVersion || currentVersion !== latestVersion) {
      migratingRef.current = true;

      console.log(
        `[AutoUpdate] 版本變更偵測: ${currentVersion || "無"} → ${latestVersion}`
      );

      // 執行資料遷移
      migrateData(latestVersion);

      // 更新 localStorage 版本
      updateVersionToLatest(latestVersion);

      // 版本變更 → 強制重新擷取所有 JSON 資料
      queryClient.invalidateQueries({ queryKey: ["jsonData"] });

      // 設定彈窗資訊（第一次載入不彈窗，只有版本升級才彈）
      if (currentVersion) {
        setUpdateInfo({
          fromVersion: currentVersion,
          toVersion: latestVersion,
          highlights,
        });
        setShowUpdateDialog(true);
      }

      migratingRef.current = false;
    }
  }, [serverVersion, queryClient]);

  // 關閉彈窗
  const dismissUpdateDialog = useCallback(() => {
    setShowUpdateDialog(false);
  }, []);

  // 提供手動觸發更新檢查的方法
  const checkForUpdates = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["autoUpdate", "latestVersion"] });
  }, [queryClient]);

  return {
    latestVersion: serverVersion?.latestVersion ?? null,
    releaseHighlights: serverVersion?.releaseHighlights ?? [],
    checkForUpdates,
    showUpdateDialog,
    updateInfo,
    dismissUpdateDialog,
  };
}
