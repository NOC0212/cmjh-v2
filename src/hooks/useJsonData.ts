import { useQuery } from "@tanstack/react-query";

/**
 * 統一 JSON 資料擷取 Hook
 *
 * 功能：
 * - 使用 TanStack Query 管理快取與背景自動重新驗證
 * - 被 useAutoUpdate 版本更新時會自動 invalidate
 * - 可在 queryKey 前綴加上 "jsonData" 以統一受版本更新控制
 *
 * @param queryKey 唯一的查詢鍵（例如 ["jsonData", "announcements"]）
 * @param url JSON 檔案路徑（例如 "/data/announcements.json"）
 * @param staleMinutes 背景重新驗證間隔（預設 5 分鐘）
 */
export function useJsonData<T>(
  queryKey: string[],
  url: string,
  staleMinutes: number = 5
) {
  return useQuery<T>({
    queryKey: ["jsonData", ...queryKey],
    queryFn: async () => {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`無法載入 ${url}: ${res.status} ${res.statusText}`);
      }
      return res.json() as Promise<T>;
    },
    staleTime: 1000 * 60 * staleMinutes,
    // 標籤頁重新 focus 時重新驗證（使用者從別的分頁回來時更新資料）
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}
