import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, SUPABASE_ENABLED } from "@/lib/supabase";
import { hashPassword } from "@/lib/crypto";
import { useCallback, useMemo } from "react";

export interface MaintenanceConfig {
  isMaintenance: boolean;
  showTimer: boolean;
  maintenanceEndTime: string;
  title: string;
  message: string;
}

export interface AppVersionConfig {
  latestVersion: string;
  releaseHighlights: string[];
}

export interface SiteConfig {
  password_hash: string;
  maintenance: MaintenanceConfig;
  app_version: AppVersionConfig;
}

const SESSION_AUTH_KEY = "cmjh-admin-authenticated";

export function getStoredPassword(): string {
  return sessionStorage.getItem(SESSION_AUTH_KEY) || "";
}

export function setStoredPassword(password: string) {
  if (password) {
    sessionStorage.setItem(SESSION_AUTH_KEY, password);
  } else {
    sessionStorage.removeItem(SESSION_AUTH_KEY);
  }
}

export function isAdminAuthenticated(): boolean {
  return !!sessionStorage.getItem(SESSION_AUTH_KEY);
}

async function fetchSiteConfig(): Promise<SiteConfig | null> {
  if (!SUPABASE_ENABLED) return null;

  const { data, error } = await supabase
    .from("site_config")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Failed to fetch site config:", error);
    return null;
  }

  return data as unknown as SiteConfig;
}

export function useSiteConfig() {
  const queryClient = useQueryClient();

  const { data: dbConfig, isLoading } = useQuery({
    queryKey: ["siteConfig"],
    queryFn: fetchSiteConfig,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: SUPABASE_ENABLED,
  });

  const maintenance = useMemo((): MaintenanceConfig | null => {
    if (dbConfig?.maintenance && Object.keys(dbConfig.maintenance).length > 0) {
      return dbConfig.maintenance as MaintenanceConfig;
    }
    return null;
  }, [dbConfig]);

  const appVersion = useMemo((): AppVersionConfig | null => {
    if (dbConfig?.app_version && Object.keys(dbConfig.app_version).length > 0) {
      return dbConfig.app_version as AppVersionConfig;
    }
    return null;
  }, [dbConfig]);

  // Update site config (maintenance + app version)
  const updateConfigMutation = useMutation({
    mutationFn: async ({
      maintenance: newMaintenance,
      appVersion: newAppVersion,
      newPassword,
    }: {
      maintenance?: MaintenanceConfig;
      appVersion?: AppVersionConfig;
      newPassword?: string;
    }) => {
      // password 已經是 SHA-256 雜湊（見 setStoredPassword），直接送出
      const password = getStoredPassword();
      const hashedPwd = newPassword ? await hashPassword(newPassword) : undefined;

      const { data, error } = await supabase.rpc("update_site_config", {
        input_password_hash: password,
        new_maintenance: newMaintenance ? JSON.parse(JSON.stringify(newMaintenance)) : null,
        new_app_version: newAppVersion ? JSON.parse(JSON.stringify(newAppVersion)) : null,
        new_password_hash: hashedPwd || null,
      });

      if (error) throw new Error(error.message || "Supabase 連線錯誤");
      if (!data) throw new Error("密碼驗證失敗");

      // 密碼變更時儲存雜湊（不儲存原始密碼）
      if (hashedPwd) {
        setStoredPassword(hashedPwd);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["siteConfig"] });
    },
  });

  return {
    maintenance,
    appVersion,
    isLoading,
    isConfigured: SUPABASE_ENABLED,
    updateConfig: updateConfigMutation.mutateAsync,
    isUpdatingConfig: updateConfigMutation.isPending,
  };
}

// Admin authentication
export async function verifyAdminPassword(inputPassword: string): Promise<boolean> {
  if (!SUPABASE_ENABLED) return false;

  const hashedInput = await hashPassword(inputPassword);

  const { data, error } = await supabase.rpc("verify_admin_password", {
    input_password_hash: hashedInput,
  });

  if (error) {
    console.error("Password verification error:", error);
    return false;
  }

  return !!data;
}

// Check if site_config has a password set
export async function hasAdminPassword(): Promise<boolean> {
  if (!SUPABASE_ENABLED) return false;

  const config = await fetchSiteConfig();
  return !!config?.password_hash;
}
