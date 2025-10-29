import { api } from "./auth";

// Универсальные типы избранного
export type FavoriteItemType =
  | "book"
  | "textbook"
  | "article"
  | "media"
  | "exercise"
  | "personality";

export interface FavoriteEntity {
  id: number;
  title?: string;
  name?: string;
  [key: string]: any;
}

// 📦 Простое внутреннее кэширование (опционально)
const cache = new Map<string, FavoriteEntity[]>();

export const favoritesApi = {
  /**
   * 📋 Получить все избранные элементы по типу
   * @param type — тип сущности (book, article, video, ...)
   */
  async getFavorites(type: FavoriteItemType): Promise<FavoriteEntity[]> {
    const cacheKey = `favorites_${type}`;

    // ✅ Возвращаем кэш, если есть
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)!;
    }

    try {
      const { data } = await api.get(`/favorites/${type}`);
      const result = Array.isArray(data) ? data : [];

      cache.set(cacheKey, result);
      return result;
    } catch (error: any) {
      console.error(`❌ Ошибка при получении избранных ${type}:`, error);
      throw new Error("Не удалось загрузить избранное");
    }
  },

  /**
   * ⭐ Добавить элемент в избранное
   * @param type — тип сущности
   * @param id — ID элемента
   */
  async add(type: FavoriteItemType, id: number): Promise<FavoriteEntity> {
    try {
      const { data } = await api.post(`/favorites/${type}/${id}`);
      cache.delete(`favorites_${type}`); // сбрасываем кэш
      return data;
    } catch (error: any) {
      console.error(
        `❌ Ошибка при добавлении ${type} #${id} в избранное`,
        error
      );
      throw new Error("Не удалось добавить в избранное");
    }
  },

  /**
   * 🗑 Удалить элемент из избранного
   * @param type — тип сущности
   * @param id — ID элемента
   */
  async remove(type: FavoriteItemType, id: number): Promise<void> {
    try {
      await api.delete(`/favorites/${type}/${id}`);
      cache.delete(`favorites_${type}`);
    } catch (error: any) {
      console.error(
        `❌ Ошибка при удалении ${type} #${id} из избранного`,
        error
      );
      throw new Error("Не удалось удалить из избранного");
    }
  },

  /**
   * 🔄 Принудительно сбросить кэш для типа
   */
  clearCache(type?: FavoriteItemType) {
    if (type) cache.delete(`favorites_${type}`);
    else cache.clear();
  },
};
