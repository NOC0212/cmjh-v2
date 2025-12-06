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
    try {
      const saved = localStorage.getItem("favorites");
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
    }
  }, []);

  const addFavorite = (item: Favorite) => {
    const newFavorites = [...favorites, item];
    setFavorites(newFavorites);
    try {
      localStorage.setItem("favorites", JSON.stringify(newFavorites));
    } catch (error) {
      console.error("Failed to save favorites:", error);
    }
  };

  const removeFavorite = (id: string) => {
    const newFavorites = favorites.filter((f) => f.id !== id);
    setFavorites(newFavorites);
    try {
      localStorage.setItem("favorites", JSON.stringify(newFavorites));
    } catch (error) {
      console.error("Failed to save favorites:", error);
    }
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
        try {
          localStorage.setItem("favorites", JSON.stringify(filtered));
        } catch (error) {
          console.error("Failed to save favorites:", error);
        }
        return filtered;
      }
      return prevFavorites;
    });
  }, []);

  return { favorites, addFavorite, removeFavorite, isFavorite, cleanupFavorites };
}
