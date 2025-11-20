import { useState, useEffect, useCallback } from "react";

export interface Favorite {
  id: string;
  type: "announcement" | "event";
  title: string;
  date: string;
  url?: string;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("favorites");
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  const addFavorite = (item: Favorite) => {
    const newFavorites = [...favorites, item];
    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
  };

  const removeFavorite = (id: string) => {
    const newFavorites = favorites.filter((f) => f.id !== id);
    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
  };

  const isFavorite = (id: string) => {
    return favorites.some((f) => f.id === id);
  };

  const cleanupFavorites = useCallback((type: "announcement" | "event", validIds: string[]) => {
    setFavorites((prevFavorites) => {
      const filtered = prevFavorites.filter((f) => {
        if (f.type !== type) return true;
        return validIds.includes(f.id);
      });
      if (filtered.length !== prevFavorites.length) {
        localStorage.setItem("favorites", JSON.stringify(filtered));
        return filtered;
      }
      return prevFavorites;
    });
  }, []);

  return { favorites, addFavorite, removeFavorite, isFavorite, cleanupFavorites };
}
