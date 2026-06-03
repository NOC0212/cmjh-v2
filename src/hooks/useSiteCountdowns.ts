import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, SUPABASE_ENABLED } from "@/lib/supabase";
import { getStoredPassword } from "./useSiteConfig";

export interface SiteCountdown {
  id: string;
  target_date: string;
  start_date: string | null;
  label: string;
  progress_label: string;
  sort_order: number;
  active: boolean;
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

export function useSiteCountdowns() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["siteCountdowns"],
    queryFn: fetchCountdownsFromSupabase,
    staleTime: 1000 * 60 * 5, // 5 minutes
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
      queryClient.invalidateQueries({ queryKey: ["siteCountdowns"] });
    },
  });

  return {
    countdowns: data || [],
    isLoading,
    error,
    isConfigured: SUPABASE_ENABLED,
    updateCountdowns: updateCountdownsMutation.mutateAsync,
    isUpdating: updateCountdownsMutation.isPending,
  };
}
