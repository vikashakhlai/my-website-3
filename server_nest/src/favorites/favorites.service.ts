import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TargetType } from 'src/common/enums/target-type.enum';
import { makeAbsoluteUrl } from 'src/utils/media-url.util';
import { In, Repository } from 'typeorm';
import { Article } from '../articles/article.entity';
import { Book } from '../books/book.entity';
import { Media } from '../media/media.entity';
import { Personality } from '../personalities/personality.entity';
import { Textbook } from '../textbooks/textbook.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { RemoveFavoriteDto } from './dto/remove-favorite.dto';
import { Favorite } from './favorite.entity';

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
      [TargetType.AUTHOR]: null,
    };
  }

  async addToFavorites(
    userId: string,
    dto: CreateFavoriteDto,
  ): Promise<Favorite> {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new BadRequestException('ID пользователя обязателен');
    }

    if (!dto || !dto.targetType || !dto.targetId) {
      throw new BadRequestException('Тип и ID цели обязательны');
    }

    const { targetType, targetId } = dto;

    if (!Object.values(TargetType).includes(targetType)) {
      throw new BadRequestException(
        `Некорректный тип цели. Допустимые значения: ${Object.values(TargetType).join(', ')}`,
      );
    }

    if (!targetId || targetId <= 0) {
      throw new BadRequestException('ID цели должен быть положительным числом');
    }

    const repo = this.repoMap[targetType];
    if (!repo) {
      throw new BadRequestException(
        `Тип "${targetType}" пока не поддерживается`,
      );
    }

    try {
      const item = await repo.findOne({ where: { id: targetId } });
      if (!item) {
        throw new NotFoundException(
          `${this.readableType(targetType)} не найден`,
        );
      }

      const existing = await this.favoriteRepo.findOne({
        where: { userId, targetType, targetId },
      });

      if (existing) {
        return existing;
      }

      const favorite = this.favoriteRepo.create({
        userId,
        targetType,
        targetId,
      });
      return await this.favoriteRepo.save(favorite);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при добавлении в избранное',
      );
    }
  }

  async removeFromFavorites(
    userId: string,
    dto: RemoveFavoriteDto,
  ): Promise<void> {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new BadRequestException('ID пользователя обязателен');
    }

    if (!dto || !dto.targetType || !dto.targetId) {
      throw new BadRequestException('Тип и ID цели обязательны');
    }

    const { targetType, targetId } = dto;

    if (!Object.values(TargetType).includes(targetType)) {
      throw new BadRequestException(
        `Некорректный тип цели. Допустимые значения: ${Object.values(TargetType).join(', ')}`,
      );
    }

    if (!targetId || targetId <= 0) {
      throw new BadRequestException('ID цели должен быть положительным числом');
    }

    try {
      const existing = await this.favoriteRepo.findOne({
        where: { userId, targetType, targetId },
      });

      if (!existing) {
        throw new NotFoundException(
          `${this.readableType(targetType)} не найден в избранном`,
        );
      }

      await this.favoriteRepo.remove(existing);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при удалении из избранного',
      );
    }
  }

  async getUserFavoritesByType(
    userId: string,
    targetType: TargetType,
  ): Promise<FavoriteResponseItem[]> {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new BadRequestException('ID пользователя обязателен');
    }

    if (!Object.values(TargetType).includes(targetType)) {
      throw new BadRequestException(
        `Некорректный тип цели. Допустимые значения: ${Object.values(TargetType).join(', ')}`,
      );
    }

    const repo = this.repoMap[targetType];
    if (!repo) {
      throw new BadRequestException(
        `Тип "${targetType}" пока не поддерживается`,
      );
    }

    try {
      const favs = await this.favoriteRepo.find({
        where: { userId, targetType },
        order: { createdAt: 'DESC' },
      });

      if (!favs.length) {
        return [];
      }

      const ids = favs.map((f) => f.targetId);
      const items = await repo.find({ where: { id: In(ids) } });

      const map = new Map(items.map((i) => [i.id, this.normalizeItem(i)]));

      return favs
        .map((f) => {
          const data = map.get(f.targetId);
          return data
            ? ({
                type: targetType,
                id: f.targetId,
                data,
              } as FavoriteResponseItem)
            : null;
        })
        .filter(Boolean) as FavoriteResponseItem[];
    } catch (error) {
      throw new InternalServerErrorException(
        'Ошибка при получении избранных по типу',
      );
    }
  }

  async getAllUserFavorites(userId: string): Promise<FavoriteResponseItem[]> {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new BadRequestException('ID пользователя обязателен');
    }

    try {
      const favs = await this.favoriteRepo.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });

      const result: FavoriteResponseItem[] = [];

      for (const f of favs) {
        const repo = this.repoMap[f.targetType];
        if (!repo) {
          continue;
        }

        const item = await repo.findOne({ where: { id: f.targetId } });
        if (!item) {
          continue;
        }

        result.push({
          type: f.targetType,
          id: f.targetId,
          data: this.normalizeItem(item),
        });
      }

      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        'Ошибка при получении всех избранных',
      );
    }
  }

  private normalizeItem(item: unknown) {
    if (item && typeof item === 'object') {
      const obj = item as Record<string, unknown>;

      if (obj.coverImage && typeof obj.coverImage === 'string') {
        obj.coverImage = makeAbsoluteUrl(obj.coverImage);
      }
      if (obj.previewUrl && typeof obj.previewUrl === 'string') {
        obj.previewUrl = makeAbsoluteUrl(obj.previewUrl);
      }
      if (obj.mediaUrl && typeof obj.mediaUrl === 'string') {
        obj.mediaUrl = makeAbsoluteUrl(obj.mediaUrl);
      }
      if (obj.subtitlesLink && typeof obj.subtitlesLink === 'string') {
        obj.subtitlesLink = makeAbsoluteUrl(obj.subtitlesLink);
      }
      if (obj.grammarLink && typeof obj.grammarLink === 'string') {
        obj.grammarLink = makeAbsoluteUrl(obj.grammarLink);
      }
      if (obj.image && typeof obj.image === 'string') {
        obj.image = makeAbsoluteUrl(obj.image);
      }
      if (obj.cover_url && typeof obj.cover_url === 'string') {
        obj.cover_url = makeAbsoluteUrl(obj.cover_url);
      }
      if (obj.imageUrl && typeof obj.imageUrl === 'string') {
        obj.imageUrl = makeAbsoluteUrl(obj.imageUrl);
      }
    }
    return item;
  }

  private readableType(type: TargetType): string {
    const readableMap: Record<TargetType, string> = {
      [TargetType.BOOK]: 'Книга',
      [TargetType.TEXTBOOK]: 'Учебник',
      [TargetType.ARTICLE]: 'Статья',
      [TargetType.MEDIA]: 'Медиа',
      [TargetType.PERSONALITY]: 'Личность',
      [TargetType.AUTHOR]: 'Автор',
    };

    return readableMap[type] || 'Неизвестный тип';
  }
}
