// src/api/account.ts
import { api } from "./auth";

export type TargetType =
  | "book"
  | "textbook"
  | "article"
  | "media"
  | "personality";

export interface AccountFavoriteItem<T = any> {
  type: TargetType;
  id: number;
  data: T;
}

export interface AccountFavoritesResponse {
  books: AccountFavoriteItem[];
  textbooks: AccountFavoriteItem[];
  articles: AccountFavoriteItem[];
  dialects: AccountFavoriteItem[];
  personalities: AccountFavoriteItem[];
}

export interface RecommendationItem<T = any> extends AccountFavoriteItem<T> {
  score: number;
  votes: number;
}

export const accountApi = {
  async getFavorites(): Promise<AccountFavoritesResponse> {
    const { data } = await api.get<AccountFavoritesResponse>(
      "/account/favorites"
    );
    return data;
  },

  async getRecommendations(): Promise<RecommendationItem[]> {
    const { data } = await api.get<RecommendationItem[]>(
      "/account/recommendations"
    );
    return data;
  },

  async getTrending(limit = 8): Promise<RecommendationItem[]> {
    const { data } = await api.get<RecommendationItem[]>(`/ratings/trending`, {
      params: { limit },
    });
    return data;
  },
};
