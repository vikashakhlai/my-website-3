import { useEffect, useState, useCallback } from "react";
import {
  favoritesApi,
  FavoriteItemType,
  FavoriteEntity,
} from "../api/favorites";

export const useFavorites = (type: FavoriteItemType) => {
  const [favorites, setFavorites] = useState<FavoriteEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await favoritesApi.getFavorites(type);
      setFavorites(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(`❌ Ошибка при загрузке избранных ${type}:`, err);
      setError("Не удалось загрузить избранное");
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const toggleFavorite = useCallback(
    async (item: FavoriteEntity) => {
      if (!item?.id) return;

      const exists = favorites.some((f) => f.id === item.id);

      try {
        if (exists) {
          await favoritesApi.remove(type, item.id);
          setFavorites((prev) => prev.filter((f) => f.id !== item.id));
        } else {
          await favoritesApi.add(type, item.id);

          // ⚠️ item может не содержать title/имя — позже нормализуем
          setFavorites((prev) => [...prev, item]);
        }
      } catch (err) {
        console.error("Ошибка при изменении избранного:", err);
      }
    },
    [favorites, type]
  );

  const isFavorite = useCallback(
    (id: number) => favorites.some((f) => f.id === id),
    [favorites]
  );

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    loading,
    error,
    reload: loadFavorites,
  };
};
