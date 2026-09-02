/** 統一資料層型別與 fetcher */

// ─── Types ───────────────────────────────────────────────────────────────────

/** 行政公告（scraper.py 產出） */
export interface Announcement {
  date: string; // YYYY-MM-DD
  category: string; // 處室/類別
  source: string;
  title: string;
  url: string;
  /** 公告內文（HTML，需經 DOMPurify 消毒後渲染） */
  content?: string;
  attachments?: AnnouncementAttachment[];
}

export interface AnnouncementAttachment {
  name: string;
  link: string;
}

/** 榮譽榜（honors_scraper.py 產出） */
export interface HonorItem {
  date: string;
  title: string;
  url: string;
  source_page: string;
}

/** 營養午餐（lunch.py 產出） */
export interface LunchData {
  last_updated: string;
  items: LunchItem[];
}

export interface LunchItem {
  category: string; // 主食 / 主菜 / 副菜 / 蔬菜 / 湯品 / 附餐
  name: string;
  image?: string;
}

/** 校園行事曆（月報 JSON） */
export type CalendarData = Record<string, CalendarEvent[]>;

export interface CalendarEvent {
  date: string; // YYYY-MM-DD
  title: string;
}

// ─── Fetchers ────────────────────────────────────────────────────────────────

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`載入 ${url} 失敗（HTTP ${res.status}）`);
  }
  return res.json() as Promise<T>;
}

export function fetchAnnouncements(): Promise<Announcement[]> {
  return fetchJson<Announcement[]>("/data/announcements.json");
}

export function fetchHonors(): Promise<HonorItem[]> {
  return fetchJson<HonorItem[]>("/data/honors.json");
}

export function fetchLunch(): Promise<LunchData> {
  return fetchJson<LunchData>("/data/lunch.json");
}

export function fetchCalendar(): Promise<CalendarData> {
  return fetchJson<CalendarData>("/data/calendar.json");
}
