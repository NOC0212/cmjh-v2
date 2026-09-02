import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, SUPABASE_ENABLED } from "@/lib/supabase";
import { getStoredPassword } from "./use-site-config";
import { queryKeys } from "@/lib/data";

export interface SiteCountdown {
  id: string;
  target_date: string;
  start_date: string | null;
  label: string;
  progress_label: string;
  sort_order: number;
  active: boolean;
  grade: string | null;
}

async function fetchCountdownsFromSupabase(): Promise<SiteCountdown[]> {
  const { data, error } = await supabase
    .from("site_countdowns")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to fetch countdowns from Supabase:", error);
    throw error;
  }

  return data as SiteCountdown[];
}

// 穩定空陣列引用，避免 data 未就緒時每次 render 產生新引用導致 effect 無限迴圈
const EMPTY_COUNTDOWNS: SiteCountdown[] = [];

export function useSiteCountdowns() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.siteCountdowns,
    queryFn: fetchCountdownsFromSupabase,
    staleTime: import.meta.env.DEV ? 0 : 1000 * 60 * 5,
    enabled: SUPABASE_ENABLED,
  });

  const updateCountdownsMutation = useMutation({
    mutationFn: async (countdowns: SiteCountdown[]) => {
      // password 已經是 SHA-256 雜湊，直接送出
      const hashedInput = getStoredPassword();
      const { data: result, error } = await supabase.rpc("update_site_countdowns", {
        input_password_hash: hashedInput,
        countdowns: JSON.parse(JSON.stringify(countdowns)),
      });

      if (error) throw new Error(error.message || "Supabase 連線錯誤");
      if (!result) throw new Error("密碼驗證失敗，請重新登入");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.siteCountdowns });
    },
  });

  return {
    countdowns: data ?? EMPTY_COUNTDOWNS,
    isLoading,
    error,
    isConfigured: SUPABASE_ENABLED,
    updateCountdowns: updateCountdownsMutation.mutateAsync,
    isUpdating: updateCountdownsMutation.isPending,
  };
}
