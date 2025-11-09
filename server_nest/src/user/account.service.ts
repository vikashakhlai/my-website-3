// src/user/account.service.ts
import { Injectable } from '@nestjs/common';
import { FavoritesService, FavoriteResponseItem } from 'src/favorites/favorites.service';
import { RatingsService, TrendingItem } from 'src/ratings/ratings.service';
import { TargetType } from 'src/common/enums/target-type.enum';

export interface AccountFavoritesResponse {
  books: FavoriteResponseItem[];
  textbooks: FavoriteResponseItem[];
  articles: FavoriteResponseItem[];
  dialects: FavoriteResponseItem[];
  personalities: FavoriteResponseItem[];
}

@Injectable()
export class AccountService {
  constructor(
    private readonly favoritesService: FavoritesService,
    private readonly ratingsService: RatingsService,
  ) {}

  async getFavoritesOverview(userId: string): Promise<AccountFavoritesResponse> {
    const [books, textbooks, articles, media, personalities] = await Promise.all([
      this.favoritesService.getUserFavoritesByType(userId, TargetType.BOOK),
      this.favoritesService.getUserFavoritesByType(userId, TargetType.TEXTBOOK),
      this.favoritesService.getUserFavoritesByType(userId, TargetType.ARTICLE),
      this.favoritesService.getUserFavoritesByType(userId, TargetType.MEDIA),
      this.favoritesService.getUserFavoritesByType(userId, TargetType.PERSONALITY),
    ]);

    const dialects = media.filter(
      (item) => item?.data?.dialect || item?.data?.dialectId || item?.data?.dialect?.name,
    );

    return {
      books,
      textbooks,
      articles,
      dialects,
      personalities,
    };
  }

  async getRecommendations(userId: string, limit = 10): Promise<TrendingItem[]> {
    const allFavorites = await this.favoritesService.getAllUserFavorites(userId);
    const favoriteKeys = new Set(allFavorites.map((item) => `${item.type}:${item.id}`));

    const trending = await this.ratingsService.getTrendingWithData(limit * 3);

    const filtered = trending.filter(
      (item) => !favoriteKeys.has(`${item.type}:${item.id}`),
    );

    const shuffled = this.shuffle(filtered);
    return shuffled.slice(0, limit);
  }

  private shuffle<T>(items: T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}

