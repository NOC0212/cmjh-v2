import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, SUPABASE_ENABLED } from "@/lib/supabase";
import { getStoredPassword } from "./useSiteConfig";

export interface SiteAnnouncement {
  id: string;
  title: string;
  date: string;
  type: "update" | "alert" | "info" | "maintenance" | string;
  pinned: boolean;
  content: string;
  sort_order: number;
  active: boolean;
}

async function fetchAnnouncementsFromSupabase(): Promise<SiteAnnouncement[]> {
  const { data, error } = await supabase
    .from("site_announcements")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to fetch announcements from Supabase:", error);
    throw error;
  }

  return data as SiteAnnouncement[];
}

export function useSiteAnnouncements() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["siteAnnouncements"],
    queryFn: fetchAnnouncementsFromSupabase,
    staleTime: 1000 * 60 * 5,
    enabled: SUPABASE_ENABLED,
  });

  const updateAnnouncementsMutation = useMutation({
    mutationFn: async (announcements: SiteAnnouncement[]) => {
      // password 已經是 SHA-256 雜湊，直接送出
      const hashedInput = getStoredPassword();
      const { data: result, error } = await supabase.rpc("update_site_announcements", {
        input_password_hash: hashedInput,
        announcements: JSON.parse(JSON.stringify(announcements)),
      });

      if (error) throw new Error(error.message || "Supabase 連線錯誤");
      if (!result) throw new Error("密碼驗證失敗，請重新登入");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["siteAnnouncements"] });
    },
  });

  return {
    announcements: data || [],
    isLoading,
    error,
    isConfigured: SUPABASE_ENABLED,
    updateAnnouncements: updateAnnouncementsMutation.mutateAsync,
    isUpdating: updateAnnouncementsMutation.isPending,
  };
}
