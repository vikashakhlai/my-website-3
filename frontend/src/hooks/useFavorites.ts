import { useEffect, useState, useCallback } from "react";
import { AxiosError } from "axios";
import {
  favoritesApi,
  FavoriteItemType,
  FavoriteEntity,
} from "../api/favorites";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const SUCCESS_MESSAGES: Record<FavoriteItemType, string> = {
  book: "Книга успешно добавлена в ваш Оазис",
  textbook: "Учебник успешно добавлен в ваш Оазис",
  article: "Статья успешно добавлена в ваш Оазис",
  media: "Материал успешно добавлен в ваш Оазис",
  personality: "Личность успешно добавлена в ваш Оазис",
};

const DUPLICATE_MESSAGES: Record<FavoriteItemType, string> = {
  book: "Книга уже есть в избранном",
  textbook: "Учебник уже есть в избранном",
  article: "Статья уже есть в избранном",
  media: "Материал уже есть в избранном",
  personality: "Личность уже есть в избранном",
};

export const useFavorites = (type: FavoriteItemType) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [favorites, setFavorites] = useState<FavoriteEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      setLoading(false);
      setError(null);
      return;
    }

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
  }, [isAuthenticated, type]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const toggleFavorite = useCallback(
    async (item: FavoriteEntity) => {
      if (!item?.id || !isAuthenticated) {
        return;
      }

      const exists = favorites.some((f) => f.id === item.id);

      try {
        if (exists) {
          await favoritesApi.remove(type, item.id);
          setFavorites((prev) => prev.filter((f) => f.id !== item.id));
        } else {
          await favoritesApi.add(type, item.id);

          // ⚠️ item может не содержать title/имя — позже нормализуем
          setFavorites((prev) => [...prev, item]);
          showToast(SUCCESS_MESSAGES[type], "success");
        }
      } catch (err) {
        console.error("Ошибка при изменении избранного:", err);
        const axiosError = err as AxiosError;
        if (axiosError?.response?.status === 409) {
          showToast(DUPLICATE_MESSAGES[type], "error");
        } else {
          showToast("Не удалось обновить избранное", "error");
        }
      }
    },
    [favorites, isAuthenticated, showToast, type]
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
