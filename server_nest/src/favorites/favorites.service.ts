import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Favorite } from './favorite.entity';
import { Book } from '../books/book.entity';
import { Textbook } from '../textbooks/textbook.entity';
import { Article } from '../articles/article.entity';
import { Media } from '../media/media.entity';
import { Personality } from '../personalities/personality.entity';

export type FavoriteType =
  | 'book'
  | 'textbook'
  | 'article'
  | 'media'
  | 'personality';

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
    @InjectRepository(Media)
    private readonly mediaRepo: Repository<Media>,
    @InjectRepository(Personality)
    private readonly personalityRepo: Repository<Personality>,
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

    if (existing) return existing;

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
  ): Promise<void> {
    const existing = await this.favoriteRepo.findOne({
      where: { userId, itemType: type, itemId },
    });

    if (!existing) {
      throw new NotFoundException(
        `${this.getReadableType(type)} не найден в избранном`,
      );
    }

    await this.favoriteRepo.remove(existing);
  }

  /** 📋 Получить избранное одного типа */
  async getUserFavorites(
    userId: string,
    type: FavoriteType,
  ): Promise<Book[] | Textbook[] | Article[] | Media[] | Personality[]> {
    const favorites = await this.favoriteRepo.find({
      where: { userId, itemType: type },
    });

    if (favorites.length === 0) {
      return [];
    }

    const ids = favorites.map((f) => f.itemId);
    const repo = this.getRepoByType(type);
    const items = await repo.find({ where: { id: In(ids) } });

    // Сохраняем порядок из избранного
    const itemMap = new Map(items.map((item) => [item.id, item]));
    const ordered = favorites
      .map((f) => itemMap.get(f.itemId))
      .filter((item): item is NonNullable<typeof item> => item != null);

    return ordered;
  }

  /** 📋 Получить все избранные элементы всех типов */
  async getAllUserFavorites(userId: string): Promise<{
    books: Book[];
    textbooks: Textbook[];
    articles: Article[];
    media: Media[];
    personalities: Personality[];
  }> {
    const favorites = await this.favoriteRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const grouped = {
      books: [] as Book[],
      textbooks: [] as Textbook[],
      articles: [] as Article[],
      media: [] as Media[],
      personalities: [] as Personality[],
    };

    // Группируем по типу
    const byType: Record<FavoriteType, number[]> = {
      book: [],
      textbook: [],
      article: [],
      media: [],
      personality: [],
    };

    for (const fav of favorites) {
      byType[fav.itemType].push(fav.itemId);
    }

    // Загружаем каждый тип отдельно — это решает проблему типизации
    if (byType.book.length) {
      const books = await this.bookRepo.find({
        where: { id: In(byType.book) },
      });
      const bookMap = new Map(books.map((b) => [b.id, b]));
      grouped.books = byType.book
        .map((id) => bookMap.get(id))
        .filter((b): b is Book => !!b);
    }

    if (byType.textbook.length) {
      const textbooks = await this.textbookRepo.find({
        where: { id: In(byType.textbook) },
      });
      const map = new Map(textbooks.map((t) => [t.id, t]));
      grouped.textbooks = byType.textbook
        .map((id) => map.get(id))
        .filter((t): t is Textbook => !!t);
    }

    if (byType.article.length) {
      const articles = await this.articleRepo.find({
        where: { id: In(byType.article) },
      });
      const map = new Map(articles.map((a) => [a.id, a]));
      grouped.articles = byType.article
        .map((id) => map.get(id))
        .filter((a): a is Article => !!a);
    }

    if (byType.media.length) {
      const media = await this.mediaRepo.find({
        where: { id: In(byType.media) },
      });
      const map = new Map(media.map((m) => [m.id, m]));
      grouped.media = byType.media
        .map((id) => map.get(id))
        .filter((m): m is Media => !!m);
    }

    if (byType.personality.length) {
      const personalities = await this.personalityRepo.find({
        where: { id: In(byType.personality) },
      });
      const map = new Map(personalities.map((p) => [p.id, p]));
      grouped.personalities = byType.personality
        .map((id) => map.get(id))
        .filter((p): p is Personality => !!p);
    }

    return grouped;
  }

  /** 🧩 Возвращает репозиторий по типу */
  private getRepoByType(type: FavoriteType): Repository<any> {
    switch (type) {
      case 'book':
        return this.bookRepo;
      case 'textbook':
        return this.textbookRepo;
      case 'article':
        return this.articleRepo;
      case 'media':
        return this.mediaRepo;
      case 'personality':
        return this.personalityRepo;
      default:
        throw new NotFoundException(
          `Неизвестный тип избранного: ${String(type)}`,
        );
    }
  }

  /** 🧠 Красивое имя типа для сообщений об ошибках */
  private getReadableType(type: FavoriteType): string {
    const map: Record<FavoriteType, string> = {
      book: 'Книга',
      textbook: 'Учебник',
      article: 'Статья',
      media: 'Медиа',
      personality: 'Личность',
    };
    return map[type];
  }
}
