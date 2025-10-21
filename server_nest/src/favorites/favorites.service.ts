import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Favorite } from './favorite.entity';
import { Book } from '../books/book.entity';
import { Textbook } from '../textbooks/textbook.entity';
import { Article } from 'src/articles/article.entity';
import { Video } from '../videos/video.entity';

export type FavoriteType = 'book' | 'textbook' | 'article' | 'video';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepo: Repository<Favorite>,

    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,

    @InjectRepository(Textbook)
    private readonly textbookRepo: Repository<Textbook>,

    @InjectRepository(Article)
    private readonly articleRepo: Repository<Article>,

    @InjectRepository(Video)
    private readonly videoRepo: Repository<Video>,
  ) {}

  /** ⭐ Добавить элемент в избранное */
  async addToFavorites(
    userId: string,
    itemId: number,
    type: FavoriteType,
  ): Promise<Favorite> {
    const repo = this.getRepoByType(type);
    const item = await repo.findOne({ where: { id: itemId } });

    if (!item) {
      throw new NotFoundException(`${this.getReadableType(type)} не найден`);
    }

    const existing = await this.favoriteRepo.findOne({
      where: { userId, itemType: type, itemId },
    });

    if (existing) {
      return existing; // уже добавлено
    }

    const favorite = this.favoriteRepo.create({
      userId,
      itemType: type,
      itemId,
    });

    return this.favoriteRepo.save(favorite);
  }

  /** 🗑 Удалить элемент из избранного */
  async removeFromFavorites(
    userId: string,
    itemId: number,
    type: FavoriteType,
  ): Promise<Favorite> {
    const existing = await this.favoriteRepo.findOne({
      where: { userId, itemType: type, itemId },
    });

    if (!existing) {
      throw new NotFoundException(
        `${this.getReadableType(type)} не найден в избранном`,
      );
    }

    return this.favoriteRepo.remove(existing);
  }

  /** 📋 Получить все избранные элементы пользователя по конкретному типу */
  async getUserFavorites(userId: string, type: FavoriteType) {
    const favorites = await this.favoriteRepo.find({
      where: { userId, itemType: type },
      order: { createdAt: 'DESC' },
    });

    if (!favorites.length) return [];

    const ids = favorites.map((f) => f.itemId);
    const repo = this.getRepoByType(type);
    const items = await repo.find({ where: { id: In(ids) } });

    // сохранить порядок избранного
    return ids
      .map((id) => items.find((i) => i.id === id))
      .filter((i): i is NonNullable<typeof i> => Boolean(i));
  }

  /** 📋 Получить все избранные элементы пользователя по типу */
  async getAllUserFavorites(userId: string) {
    const favorites = await this.favoriteRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const grouped = {
      books: [] as Book[],
      textbooks: [] as Textbook[],
      articles: [] as Article[],
      videos: [] as Video[],
    };

    for (const type of ['book', 'textbook', 'article', 'video'] as const) {
      const ids = favorites
        .filter((f) => f.itemType === type)
        .map((f) => f.itemId);
      if (!ids.length) continue;

      const repo = this.getRepoByType(type);
      const items = await repo.find({ where: { id: In(ids) } });
      (grouped as any)[`${type}s`] = ids
        .map((id) => items.find((i) => i.id === id))
        .filter(Boolean);
    }

    return grouped;
  }

  /** 🧩 Определяем, какой репозиторий использовать */
  private getRepoByType(
    type: FavoriteType,
  ): Repository<Book | Textbook | Article | Video> {
    switch (type) {
      case 'book':
        return this.bookRepo as Repository<Book | Textbook | Article | Video>;
      case 'textbook':
        return this.textbookRepo as Repository<
          Book | Textbook | Article | Video
        >;
      case 'article':
        return this.articleRepo as Repository<
          Book | Textbook | Article | Video
        >;
      case 'video':
        return this.videoRepo as Repository<Book | Textbook | Article | Video>;
      default:
        throw new NotFoundException(`Неизвестный тип избранного: ${type}`);
    }
  }

  /** 🧠 Красивое имя типа для сообщений об ошибках */
  private getReadableType(type: FavoriteType): string {
    const map: Record<FavoriteType, string> = {
      book: 'Книга',
      textbook: 'Учебник',
      article: 'Статья',
      video: 'Видео',
    };
    return map[type];
  }
}
