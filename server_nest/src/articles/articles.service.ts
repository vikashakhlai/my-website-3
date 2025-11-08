import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { Article } from './article.entity';
import { Theme } from './themes/theme.entity';

import { CreateExerciseDto } from './dto/create-exercise.dto';
import { Distractor } from './entities/distractor.entity';
import { ExerciseItem } from './entities/exercise-item.entity';
import { ExerciseType } from './entities/exercise-type.enum';
import { Exercise } from './entities/exercise.entity';

import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

import { TargetType } from 'src/common/enums/target-type.enum';

import { Comment } from 'src/comments/comment.entity';
import { Rating } from 'src/ratings/rating.entity';

interface ExerciseItemWithOptions extends ExerciseItem {
  options?: string[];
}

interface ExerciseWithItems extends Exercise {
  items: ExerciseItemWithOptions[];
}

export interface ArticleWithExtras extends Article {
  exercises: ExerciseWithItems[];
  themeRu?: string | null;
  averageRating?: number | null;
  ratingCount?: number;
  userRating?: number | null;
  commentCount?: number;
}

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepo: Repository<Article>,

    @InjectRepository(Theme)
    private readonly themeRepo: Repository<Theme>,

    @InjectRepository(Exercise)
    private readonly exerciseRepo: Repository<Exercise>,

    @InjectRepository(ExerciseItem)
    private readonly exerciseItemRepo: Repository<ExerciseItem>,

    @InjectRepository(Distractor)
    private readonly distractorRepo: Repository<Distractor>,

    @InjectRepository(Rating)
    private readonly ratingRepo: Repository<Rating>,

    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
  ) {}

  async getLatest(limit = 3): Promise<Article[]> {
    const articles = await this.articleRepo.find({
      relations: ['theme'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return articles.map((a) => ({
      ...a,
      themeRu: a.theme?.name_ru || null,
    }));
  }

  async getArticles(themeSlug?: string, limit = 10): Promise<Article[]> {
    const qb = this.articleRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.theme', 't')
      .orderBy('a.createdAt', 'DESC')
      .limit(limit);

    if (themeSlug) qb.where('t.slug = :slug', { slug: themeSlug });

    const articles = await qb.getMany();

    return articles.map((a) => ({
      ...a,
      themeRu: a.theme?.name_ru || null,
    }));
  }

  async getById(id: number, userId?: string): Promise<ArticleWithExtras> {
    const article = await this.articleRepo.findOne({
      where: { id },
      relations: ['theme'],
    });
    if (!article) throw new NotFoundException('Статья не найдена');

    const exercises = await this.exerciseRepo.find({
      where: { article: { id } },
      order: { id: 'ASC' },
    });

    const enrichedExercises: ExerciseWithItems[] = [];
    for (const ex of exercises) {
      const items = await this.exerciseItemRepo.find({
        where: { exercise: { id: ex.id } },
        order: { position: 'ASC' },
      });

      const exType = ex.type as ExerciseType;

      if (exType === ExerciseType.FILL_IN_THE_BLANKS) {
        const processed = items.map((item) => {
          const distractors =
            item.distractors?.filter(
              (d): d is string => typeof d === 'string',
            ) ?? [];
          const correct = item.correctAnswer ?? '';
          const options = [...distractors, correct].filter(Boolean);
          return { ...item, options };
        });
        enrichedExercises.push({ ...ex, items: processed });
      } else if (
        exType === ExerciseType.MULTIPLE_CHOICE ||
        exType === ExerciseType.MATCHING_PAIRS
      ) {
        let poolWords: string[] = [];
        if (ex.distractorPoolId) {
          const distractors = await this.distractorRepo.find({
            where: { distractorPool: { id: ex.distractorPoolId } },
          });
          poolWords = distractors
            .map((d) => d.word)
            .filter((w): w is string => !!w);
        }

        const processed = items.map((item) => {
          const correct = item.correctAnswer ?? '';
          const allOptions = [...new Set([...poolWords, correct])].filter(
            Boolean,
          );
          return { ...item, options: allOptions };
        });

        enrichedExercises.push({ ...ex, items: processed });
      } else {
        enrichedExercises.push({ ...ex, items });
      }
    }

    const ratings = await this.ratingRepo.find({
      where: {
        target_type: TargetType.ARTICLE,
        target_id: id,
      },
    });

    const commentsCount = await this.commentRepo.count({
      where: {
        target_type: TargetType.ARTICLE,
        target_id: id,
      },
    });

    const average =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
        : null;

    const userRating = userId
      ? (ratings.find((r) => r.user_id === userId)?.value ?? null)
      : null;

    return {
      ...article,
      themeRu: article.theme?.name_ru || null,
      exercises: enrichedExercises,
      averageRating: average,
      ratingCount: ratings.length,
      userRating,
      commentCount: commentsCount,
    };
  }

  async create(dto: CreateArticleDto): Promise<Article> {
    const entity = this.articleRepo.create({
      ...dto,
    } as DeepPartial<Article>);
    const saved = await this.articleRepo.save(entity);
    return this.articleRepo.findOne({
      where: { id: saved.id },
      relations: ['theme'],
    }) as Promise<Article>;
  }

  async update(id: number, dto: UpdateArticleDto): Promise<Article> {
    const article = await this.articleRepo.findOne({ where: { id } });
    if (!article) throw new NotFoundException('Статья не найдена');

    Object.assign(article, dto);
    await this.articleRepo.save(article);

    return this.articleRepo.findOne({
      where: { id },
      relations: ['theme'],
    }) as Promise<Article>;
  }

  async remove(id: number): Promise<{ message: string }> {
    const article = await this.articleRepo.findOne({ where: { id } });
    if (!article) throw new NotFoundException('Статья не найдена');

    await this.ratingRepo.delete({
      target_type: TargetType.ARTICLE,
      target_id: id,
    });

    await this.commentRepo.delete({
      target_type: TargetType.ARTICLE,
      target_id: id,
    });

    await this.articleRepo.remove(article);
    return { message: `Article #${id} has been removed` };
  }

  async findExercisesByArticle(articleId: number): Promise<Exercise[]> {
    const exists = await this.articleRepo.exists({ where: { id: articleId } });
    if (!exists) throw new NotFoundException('Статья не найдена');

    return this.exerciseRepo.find({
      where: { article: { id: articleId } },
      relations: ['items'],
      order: { id: 'ASC' },
    });
  }

  async addExerciseToArticle(
    articleId: number,
    dto: CreateExerciseDto,
  ): Promise<Exercise> {
    const article = await this.articleRepo.findOne({
      where: { id: articleId },
    });
    if (!article) {
      throw new NotFoundException(`Статья с ID ${articleId} не найдена`);
    }

    if (dto.items) {
      dto.items = dto.items.filter(
        (v, i, arr) =>
          i === arr.findIndex((t) => t.questionRu === v.questionRu),
      );
    }

    const exercise: DeepPartial<Exercise> = {
      type: dto.type,
      instructionRu: dto.instructionRu,
      instructionAr: dto.instructionAr,
      article,
      distractorPoolId: dto.distractorPoolId,
      items: dto.items?.map((item, index) => {
        const entity = new ExerciseItem();
        entity.position = item.position ?? index + 1;
        entity.questionRu = item.questionRu ?? undefined;
        entity.questionAr = item.questionAr ?? undefined;
        entity.partBefore = item.partBefore ?? undefined;
        entity.partAfter = item.partAfter ?? undefined;
        entity.correctAnswer = item.correctAnswer ?? undefined;
        entity.wordRu = item.wordRu ?? undefined;
        entity.wordAr = item.wordAr ?? undefined;
        entity.distractors = item.distractors ?? [];
        return entity;
      }) as DeepPartial<ExerciseItem>[],
    };

    const saved = await this.exerciseRepo.save(
      this.exerciseRepo.create(exercise),
    );

    return this.exerciseRepo.findOne({
      where: { id: saved.id },
      relations: ['items'],
    }) as Promise<Exercise>;
  }

  async rateArticle(
    articleId: number,
    userId: string,
    value: number,
  ): Promise<{ average: number; votes: number; value: number }> {
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      throw new BadRequestException('Значение рейтинга должно быть от 1 до 5');
    }

    const exists = await this.articleRepo.exists({ where: { id: articleId } });
    if (!exists) throw new NotFoundException('Статья не найдена');

    const existing = await this.ratingRepo.findOne({
      where: {
        user_id: userId,
        target_type: TargetType.ARTICLE,
        target_id: articleId,
      },
    });

    if (existing) {
      existing.value = value;
      await this.ratingRepo.save(existing);
    } else {
      const entity = this.ratingRepo.create({
        user_id: userId,
        target_type: TargetType.ARTICLE,
        target_id: articleId,
        value,
      } as DeepPartial<Rating>);
      await this.ratingRepo.save(entity);
    }

    const { avg, count } = await this.ratingRepo
      .createQueryBuilder('r')
      .select('AVG(r.value)', 'avg')
      .addSelect('COUNT(r.id)', 'count')
      .where('r.target_type = :t', { t: TargetType.ARTICLE })
      .andWhere('r.target_id = :id', { id: articleId })
      .getRawOne();

    return {
      average: avg ? Number(parseFloat(avg).toFixed(2)) : 0,
      votes: count ? Number(count) : 0,
      value,
    };
  }
}
