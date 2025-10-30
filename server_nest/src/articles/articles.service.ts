import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Article } from './article.entity';
import { Theme } from './themes/theme.entity';
import { Exercise } from './entities/exercise.entity';
import { ExerciseItem } from './entities/exercise-item.entity';
import { Distractor } from './entities/distractor.entity';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { ExerciseType } from './entities/exercise-type.enum';

// 👇 Добавляем рейтинги и комментарии
import { Rating } from 'src/ratings/rating.entity';
import { Comment } from 'src/comments/comment.entity';

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

    // ⭐ Новое
    @InjectRepository(Rating)
    private readonly ratingRepo: Repository<Rating>,

    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
  ) {}

  /** 📰 Получить последние N статей */
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

  /** 📚 Получить список статей (опционально по теме) */
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

  /** 🔍 Получить статью по ID (с упражнениями, рейтингом и комментариями) */
  async getById(id: number, userId?: string): Promise<ArticleWithExtras> {
    const article = await this.articleRepo.findOne({
      where: { id },
      relations: ['theme'],
    });

    if (!article) {
      throw new NotFoundException('Статья не найдена');
    }

    // === 🧩 Загружаем упражнения ===
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

          console.log(`🎯 Distractors for exercise ${ex.id}:`, distractors);

          poolWords = distractors
            .map((d) => d.word)
            .filter((w): w is string => !!w);
        } else {
          console.warn(`⚠️ У упражнения ${ex.id} нет distractorPoolId`);
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
        // Все остальные типы — open_question, flashcards и т.п.
        enrichedExercises.push({ ...ex, items });
      }
    }

    // === ⭐ Загружаем рейтинги и комментарии ===
    const ratings = await this.ratingRepo.find({
      where: { target_type: 'article', target_id: id },
    });

    const commentsCount = await this.commentRepo.count({
      where: { target_type: 'article', target_id: id },
    });

    const average =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
        : null;

    const userRating = userId
      ? (ratings.find((r) => r.user_id === userId)?.value ?? null)
      : null;

    // ✅ Возвращаем статью со всем
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
        entity.position = index + 1;
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

    const entity = this.exerciseRepo.create(exercise);
    return await this.exerciseRepo.save(entity);
  }
}
