import { useQuery } from "@tanstack/react-query";
import { supabase, SUPABASE_ENABLED } from "@/lib/supabase";

export interface VisitStatsByPeriod {
  today: number;
  this_week: number;
  this_month: number;
  this_year: number;
  total: number;
}

export interface DailyVisit {
  date: string;
  count: number;
}

async function fetchVisitStats(): Promise<VisitStatsByPeriod> {
  const { data, error } = await supabase.rpc("get_visit_stats_by_period");
  if (error) throw error;
  return data as unknown as VisitStatsByPeriod;
}

async function fetchDailyVisits(days: number): Promise<DailyVisit[]> {
  const { data, error } = await supabase.rpc("get_daily_visits", { days });
  if (error) throw error;
  return data as unknown as DailyVisit[];
}

export function useVisitStats(days: number = 30) {
  const { data: periodData, isLoading, isError, refetch } = useQuery({
    queryKey: ["visitStats"],
    queryFn: fetchVisitStats,
    staleTime: 1000 * 60 * 2,
    enabled: SUPABASE_ENABLED,
  });

  const { data: dailyData = [], isLoading: dailyLoading } = useQuery({
    queryKey: ["dailyVisits", days],
    queryFn: () => fetchDailyVisits(days),
    staleTime: 1000 * 60 * 2,
    enabled: SUPABASE_ENABLED,
  });

  return {
    stats: periodData ?? {
      today: 0,
      this_week: 0,
      this_month: 0,
      this_year: 0,
      total: 0,
    },
    dailyVisits: dailyData,
    isLoading: isLoading && SUPABASE_ENABLED,
    dailyLoading,
    isError,
    isConfigured: SUPABASE_ENABLED,
    refetch,
  };
}
