import { useState, useEffect } from "react";

export interface CommonSite {
  id: string;
  name: string;
  url: string;
  order: number;
}

const DEFAULT_SITES: CommonSite[] = [
  { id: "site-1", name: "114上學期行事曆", url: "/114學年度第一學期行事曆.pdf", order: 0 },
  { id: "site-2", name: "晨間英語多媒體播放", url: "/英聽挑戰.pdf", order: 1 },
  { id: "site-3", name: "段考成績查詢", url: "http://120.115.12.4/", order: 2 },
  { id: "site-4", name: "12年國教專區", url: "https://jhquery.tn.edu.tw/", order: 3 },
  { id: "site-5", name: "國中學生輔導資料", url: "https://jhc.tn.edu.tw/Login.action", order: 4 },
  { id: "site-6", name: "翰林雲端學院TEAMS", url: "https://cmjhtn.teamslite.com.tw/v2/login.html", order: 5 },
  { id: "site-7", name: "教育部因材網", url: "https://adl.edu.tw/HomePage/home/", order: 6 },
  { id: "site-8", name: "布可星球", url: "https://read.tn.edu.tw/", order: 7 },
];

const STORAGE_KEY = "cmjh-common-sites";

export function useCommonSites() {
  const [sites, setSites] = useState<CommonSite[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
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

  const addSite = (name: string, url: string) => {
    const newSite: CommonSite = {
      id: `site-${Date.now()}`,
      name,
      url,
      order: sites.length,
    };
    setSites((prev) => [...prev, newSite]);
  };

  const updateSite = (id: string, name: string, url: string) => {
    setSites((prev) =>
      prev.map((site) => (site.id === id ? { ...site, name, url } : site))
    );
  };

  const deleteSite = (id: string) => {
    setSites((prev) => {
      const filtered = prev.filter((site) => site.id !== id);
      // 重新排序
      return filtered.map((site, index) => ({ ...site, order: index }));
    });
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

  const sortedSites = [...sites].sort((a, b) => a.order - b.order);

  return {
    sites: sortedSites,
    addSite,
    updateSite,
    deleteSite,
    moveSiteUp,
    moveSiteDown,
    resetToDefault,
  };
}

