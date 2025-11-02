import { api } from "./auth";

export type FavoriteItemType =
  | "book"
  | "textbook"
  | "article"
  | "media"
  | "personality";

export interface FavoriteEntity {
  id: number;
  title?: string;
  name?: string;
  [key: string]: any;
}

const cache = new Map<string, FavoriteEntity[]>();

export const favoritesApi = {
  /** 📋 Получить избранное по типу */
  async getFavorites(type: FavoriteItemType): Promise<FavoriteEntity[]> {
    const cacheKey = `favorites_${type}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey)!;

    const { data } = await api.get(`/favorites/by-type/${type}`);
    cache.set(cacheKey, data);
    return data;
  },

  /** ⭐ Добавить в избранное */
  async add(type: FavoriteItemType, id: number) {
    await api.post(`/favorites`, {
      targetType: type,
      targetId: id,
    });
    cache.delete(`favorites_${type}`);
  },

  /** 🗑 Удалить из избранного */
  async remove(type: FavoriteItemType, id: number) {
    await api.delete(`/favorites`, {
      data: {
        targetType: type,
        targetId: id,
      },
    });
    cache.delete(`favorites_${type}`);
  },

  clearCache(type?: FavoriteItemType) {
    if (type) cache.delete(`favorites_${type}`);
    else cache.clear();
  },
};
