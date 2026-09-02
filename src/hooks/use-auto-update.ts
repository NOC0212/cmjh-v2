import { useEffect, useRef, useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, SUPABASE_ENABLED } from "@/lib/supabase";
import { getCurrentVersion, updateVersionToLatest, migrateData } from "@/lib/app-version";
import { queryKeys } from "@/lib/data";

interface AppVersionConfig {
  latestVersion: string;
  releaseHighlights: string[];
}

export interface UpdateInfo {
  fromVersion: string;
  toVersion: string;
  highlights: string[];
}

/** 中央背景自動更新 */
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

  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);

  // 定期檢查伺服器版本（5 分鐘）
  const { data: serverVersion } = useQuery({
    queryKey: ["autoUpdate", "latestVersion"],
    queryFn: fetchLatestVersion,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
    enabled: SUPABASE_ENABLED,
  });

  // 版本變更時自動遷移
  useEffect(() => {
    if (!serverVersion?.latestVersion) return;
    if (migratingRef.current) return;

    const currentVersion = getCurrentVersion();
    const latestVersion = serverVersion.latestVersion;
    const highlights = serverVersion.releaseHighlights || [];

    if (!currentVersion || currentVersion !== latestVersion) {
      migratingRef.current = true;

      console.log(`[AutoUpdate] 版本變更偵測: ${currentVersion || "無"} → ${latestVersion}`);

      migrateData(latestVersion);
      updateVersionToLatest(latestVersion);

      // 版本變更 → 強制重新擷取靜態 JSON 資料
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements });
      queryClient.invalidateQueries({ queryKey: queryKeys.honors });
      queryClient.invalidateQueries({ queryKey: queryKeys.lunch });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar });

      // 第一次載入不彈窗，只有版本升級才彈
      if (currentVersion) {
        setUpdateInfo({ fromVersion: currentVersion, toVersion: latestVersion, highlights });
        setShowUpdateDialog(true);
      }

      migratingRef.current = false;
    }
  }, [serverVersion, queryClient]);

  const dismissUpdateDialog = useCallback(() => {
    setShowUpdateDialog(false);
  }, []);

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
