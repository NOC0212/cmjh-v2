import { useQuery } from "@tanstack/react-query";
import { supabase, SUPABASE_ENABLED } from "@/lib/supabase";

interface VisitStats {
  total: number;
  today: number;
}

/** 訪問計數（跨日自動重置今日計數） */
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
