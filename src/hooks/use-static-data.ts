import { useQuery } from "@tanstack/react-query";
import {
  fetchAnnouncements,
  fetchHonors,
  fetchLunch,
  fetchCalendar,
  queryKeys,
  type Announcement,
  type HonorItem,
  type LunchData,
  type CalendarData,
} from "@/lib/data";

/** 行政公告 */
export function useAnnouncements() {
  return useQuery<Announcement[]>({
    queryKey: queryKeys.announcements,
    queryFn: fetchAnnouncements,
    staleTime: 10 * 60 * 1000,
  });
}

/** 榮譽榜 */
export function useHonors() {
  return useQuery<HonorItem[]>({
    queryKey: queryKeys.honors,
    queryFn: fetchHonors,
    staleTime: 10 * 60 * 1000,
  });
}

/** 營養午餐 */
export function useLunch() {
  return useQuery<LunchData>({
    queryKey: queryKeys.lunch,
    queryFn: fetchLunch,
    staleTime: 10 * 60 * 1000,
  });
}

/** 校園行事曆 */
export function useSchoolCalendar() {
  return useQuery<CalendarData>({
    queryKey: queryKeys.calendar,
    queryFn: fetchCalendar,
    staleTime: 10 * 60 * 1000,
  });
}
