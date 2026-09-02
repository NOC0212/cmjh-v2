import { useState, useEffect } from "react";
import { STORAGE_KEYS } from "@/lib/app-version";

export interface CommonSite {
  id: string;
  name: string;
  url: string;
  category: string;
  order: number;
}

export const SITE_CATEGORIES = [
  { value: "school", label: "校園行政" },
  { value: "query", label: "查詢系統" },
  { value: "learning", label: "學習資源" },
  { value: "other", label: "其他" },
] as const;

const DEFAULT_CATEGORY = "other";

const DEFAULT_SITES: CommonSite[] = [
  { id: "site-1", name: "114上學期行事曆", url: "/114學年度第一學期行事曆.pdf", category: "school", order: 0 },
  { id: "site-2", name: "崇明國中v2平台使用指南", url: "https://nocfond.us.ci/blog/cmjh-v2", category: "school", order: 1 },
  { id: "site-3", name: "段考成績查詢", url: "http://120.115.12.4/", category: "query", order: 2 },
  { id: "site-4", name: "12年國教專區", url: "https://jhquery.tn.edu.tw/", category: "query", order: 3 },
  { id: "site-5", name: "國中學生輔導資料", url: "https://jhc.tn.edu.tw/Login.action", category: "query", order: 4 },
  { id: "site-6", name: "翰林雲端學院TEAMS", url: "https://cmjhtn.teamslite.com.tw/v2/login.html", category: "learning", order: 5 },
  { id: "site-7", name: "教育部因材網", url: "https://adl.edu.tw/HomePage/home/", category: "learning", order: 6 },
  { id: "site-8", name: "布可星球", url: "https://read.tn.edu.tw/", category: "learning", order: 7 },
];

const STORAGE_KEY = STORAGE_KEYS.COMMON_SITES;

const isValidCategory = (category: string): boolean =>
  SITE_CATEGORIES.some((c) => c.value === category);

// 舊版資料沒有 category：若 id 對應到預設網站則沿用預設分類，其餘歸入「其他」
const DEFAULT_CATEGORY_BY_ID = new Map(DEFAULT_SITES.map((s) => [s.id, s.category]));

const normalizeSites = (list: CommonSite[]): CommonSite[] =>
  list.map((site, index) => ({
    id: site.id,
    name: site.name,
    url: site.url,
    category: isValidCategory(site.category)
      ? site.category
      : (DEFAULT_CATEGORY_BY_ID.get(site.id) ?? DEFAULT_CATEGORY),
    order: typeof site.order === "number" ? site.order : index,
  }));

export function useCommonSites() {
  const [sites, setSites] = useState<CommonSite[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return normalizeSites(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load common sites:", error);
    }
    return DEFAULT_SITES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sites));
    } catch (error) {
      console.error("Failed to save common sites:", error);
    }
  }, [sites]);

  const addSite = (name: string, url: string, category: string = DEFAULT_CATEGORY) => {
    setSites((prev) => [
      ...prev,
      {
        id: `site-${Date.now()}`,
        name,
        url,
        category: isValidCategory(category) ? category : DEFAULT_CATEGORY,
        order: prev.length,
      },
    ]);
  };

  const updateSite = (id: string, name: string, url: string, category: string) => {
    setSites((prev) =>
      prev.map((site) =>
        site.id === id
          ? { ...site, name, url, category: isValidCategory(category) ? category : DEFAULT_CATEGORY }
          : site,
      ),
    );
  };

  const deleteSite = (id: string) => {
    setSites((prev) =>
      prev.filter((site) => site.id !== id).map((site, index) => ({ ...site, order: index })),
    );
  };

  const moveSiteUp = (id: string) => {
    setSites((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex((site) => site.id === id);
      if (index <= 0) return prev;
      const temp = sorted[index].order;
      sorted[index].order = sorted[index - 1].order;
      sorted[index - 1].order = temp;
      return sorted;
    });
  };

  const moveSiteDown = (id: string) => {
    setSites((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex((site) => site.id === id);
      if (index < 0 || index >= sorted.length - 1) return prev;
      const temp = sorted[index].order;
      sorted[index].order = sorted[index + 1].order;
      sorted[index + 1].order = temp;
      return sorted;
    });
  };

  const resetToDefault = () => {
    setSites(DEFAULT_SITES);
  };

  const getCategoryLabel = (value: string): string =>
    SITE_CATEGORIES.find((c) => c.value === value)?.label ?? "其他";

  const sortedSites = [...sites].sort((a, b) => a.order - b.order);

  return {
    sites: sortedSites,
    addSite,
    updateSite,
    deleteSite,
    moveSiteUp,
    moveSiteDown,
    resetToDefault,
    setSites,
    getCategoryLabel,
  };
}
