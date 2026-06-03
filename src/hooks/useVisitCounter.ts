import { useQuery } from "@tanstack/react-query";
import { supabase, SUPABASE_ENABLED } from "@/lib/supabase";

interface VisitStats {
  total: number;
  today: number;
}

/**
 * useVisitCounter
 *
 * 在元件掛載時呼叫 Supabase RPC 遞增訪問計數（跨日自動重置今日計數），
 * 並回傳 { total, today } 兩個數據。
 * 透過 staleTime: Infinity 確保只會在首次載入時觸發一次。
 */
export function useVisitCounter() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["visitCount"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("increment_visit_count");
      if (error) throw error;
      return data as unknown as VisitStats;
    },
    staleTime: Infinity,
    retry: 1,
    enabled: SUPABASE_ENABLED,
  });

  return {
    total: data?.total ?? 0,
    today: data?.today ?? 0,
    isLoading: isLoading && SUPABASE_ENABLED,
    isError,
    isConfigured: SUPABASE_ENABLED,
  };
}
