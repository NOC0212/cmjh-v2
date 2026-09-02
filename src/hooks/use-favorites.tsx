import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

export interface Favorite {
  id: string;
  type: "announcement" | "event" | "honor";
  title: string;
  date: string;
  url?: string;
  content?: string;
  category?: string;
  source?: string;
  links?: { name: string; link: string }[];
}

const FAVORITES_KEY = "favorites";

interface FavoritesContextValue {
  favorites: Favorite[];
  addFavorite: (item: Favorite) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  /** 清理已失效的收藏 */
  cleanupFavorites: (type: Favorite["type"], validIds: string[]) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

function loadFavorites(): Favorite[] {
  try {
    const saved = localStorage.getItem(FAVORITES_KEY);
    return saved ? (JSON.parse(saved) as Favorite[]) : [];
  } catch (error) {
    console.error("Failed to load favorites:", error);
    return [];
  }
}

function saveFavorites(items: Favorite[]) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to save favorites:", error);
  }
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Favorite[]>(loadFavorites);

  useEffect(() => {
    // 跨分頁同步
    const onStorage = (e: StorageEvent) => {
      if (e.key === FAVORITES_KEY) {
        setFavorites(loadFavorites());
      }
    };
    // 同頁面跨實例同步（Provider 單一實例時其實不需要，保留保險）
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const addFavorite = useCallback(
    (item: Favorite) => {
      setFavorites((prev) => {
        if (prev.some((f) => f.id === item.id)) return prev;
        const next = [...prev, item];
        saveFavorites(next);
        return next;
      });
    },
    [],
  );

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.filter((f) => f.id !== id);
      saveFavorites(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => favorites.some((f) => f.id === id), [favorites]);

  const cleanupFavorites = useCallback(
    (type: Favorite["type"], validIds: string[]) => {
      setFavorites((prev) => {
        const filtered = prev.filter((f) => {
          if (f.type !== type) return true;
          return validIds.includes(f.id);
        });
        if (filtered.length !== prev.length) {
          saveFavorites(filtered);
          return filtered;
        }
        return prev;
      });
    },
    [],
  );

  const value = useMemo(
    () => ({ favorites, addFavorite, removeFavorite, isFavorite, cleanupFavorites }),
    [favorites, addFavorite, removeFavorite, isFavorite, cleanupFavorites],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return ctx;
}
