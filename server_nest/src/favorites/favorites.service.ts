import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Favorite } from './favorite.entity';
import { Book } from '../books/book.entity';
import { Textbook } from '../textbooks/textbook.entity';
import { Article } from '../articles/article.entity';
import { Media } from '../media/media.entity';
import { Personality } from '../personalities/personality.entity';
import { TargetType } from 'src/common/enums/target-type.enum';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { RemoveFavoriteDto } from './dto/remove-favorite.dto';

export interface FavoriteResponseItem<T = any> {
  type: TargetType;
  id: number;
  data: T;
}

@Injectable()
export class FavoritesService {
  private repoMap: Record<TargetType, Repository<any> | null>;

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
  ) {
    this.repoMap = {
      [TargetType.BOOK]: this.bookRepo,
      [TargetType.TEXTBOOK]: this.textbookRepo,
      [TargetType.ARTICLE]: this.articleRepo,
      [TargetType.MEDIA]: this.mediaRepo,
      [TargetType.PERSONALITY]: this.personalityRepo,
      [TargetType.AUTHOR]: null, // TODO: будет позже
    };
  }

  /** ⭐ Добавить элемент в избранное */
  async addToFavorites(
    userId: string,
    dto: CreateFavoriteDto,
  ): Promise<Favorite> {
    const { targetType, targetId } = dto;

    const repo = this.repoMap[targetType];
    if (!repo) {
      throw new BadRequestException(
        `Тип "${targetType}" пока не поддерживается`,
      );
    }

    const item = await repo.findOne({ where: { id: targetId } });
    if (!item) {
      throw new NotFoundException(`${this.readableType(targetType)} не найден`);
    }

    const existing = await this.favoriteRepo.findOne({
      where: { userId, targetType, targetId },
    });

    if (existing) return existing;

    return this.favoriteRepo.save(
      this.favoriteRepo.create({ userId, targetType, targetId }),
    );
  }

  /** 🗑 Удалить элемент */
  async removeFromFavorites(
    userId: string,
    dto: RemoveFavoriteDto,
  ): Promise<void> {
    const { targetType, targetId } = dto;

    const existing = await this.favoriteRepo.findOne({
      where: { userId, targetType, targetId },
    });

    if (!existing) {
      throw new NotFoundException(
        `${this.readableType(targetType)} не найден в избранном`,
      );
    }

    await this.favoriteRepo.remove(existing);
  }

  /** 📋 Избранное одного типа — универсальный формат */
  async getUserFavoritesByType(
    userId: string,
    targetType: TargetType,
  ): Promise<FavoriteResponseItem[]> {
    const repo = this.repoMap[targetType];
    if (!repo) {
      throw new BadRequestException(
        `Тип "${targetType}" пока не поддерживается`,
      );
    }

    const favs = await this.favoriteRepo.find({
      where: { userId, targetType },
      order: { createdAt: 'DESC' },
    });

    if (!favs.length) return [];

    const ids = favs.map((f) => f.targetId);
    const items = await repo.find({ where: { id: In(ids) } });

    const map = new Map(items.map((i) => [i.id, i]));

    return favs
      .map((f) => {
        const data = map.get(f.targetId);
        return data
          ? ({ type: targetType, id: f.targetId, data } as FavoriteResponseItem)
          : null;
      })
      .filter(Boolean) as FavoriteResponseItem[];
  }

  /** 📋 Все избранные элементы — универсальный массив */
  async getAllUserFavorites(userId: string): Promise<FavoriteResponseItem[]> {
    const favs = await this.favoriteRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const result: FavoriteResponseItem[] = [];

    for (const f of favs) {
      const repo = this.repoMap[f.targetType];
      if (!repo) continue;

      const item = await repo.findOne({ where: { id: f.targetId } });
      if (!item) continue; // ✅ фильтруем удалённые сущности

      result.push({
        type: f.targetType,
        id: f.targetId,
        data: item,
      });
    }

    return result;
  }

  /** 🧠 Человеческое имя */
  private readableType(type: TargetType): string {
    return {
      [TargetType.BOOK]: 'Книга',
      [TargetType.TEXTBOOK]: 'Учебник',
      [TargetType.ARTICLE]: 'Статья',
      [TargetType.MEDIA]: 'Медиа',
      [TargetType.PERSONALITY]: 'Личность',
      [TargetType.AUTHOR]: 'Автор',
    }[type];
  }
}
