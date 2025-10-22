import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './article.entity';
import { Theme } from './themes/theme.entity';
import { Exercise } from './entities/exercise.entity';
import { ExerciseItem } from './entities/exercise-item.entity';
import { Distractor } from './entities/distractor.entity';

interface ExerciseItemWithOptions extends ExerciseItem {
  options?: string[];
}

interface ExerciseWithItems extends Exercise {
  items: ExerciseItemWithOptions[];
}

interface ArticleWithExercises extends Article {
  exercises: ExerciseWithItems[];
  themeRu?: string | null;
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
  ) {}

  /** 📰 Получить последние N статей */
  async getLatest(limit = 3): Promise<Article[]> {
    const articles = await this.articleRepo.find({
      relations: ['theme'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    // ✅ добавляем themeRu
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

    if (themeSlug) {
      qb.where('t.slug = :slug', { slug: themeSlug });
    }

    const articles = await qb.getMany();

    // ✅ тоже добавляем themeRu
    return articles.map((a) => ({
      ...a,
      themeRu: a.theme?.name_ru || null,
    }));
  }

  /** 🔍 Получить статью по ID (с упражнениями и заданиями) */
  async getById(id: number): Promise<ArticleWithExercises> {
    const article = await this.articleRepo.findOne({
      where: { id },
      relations: ['theme'],
    });

    if (!article) {
      throw new NotFoundException('Статья не найдена');
    }

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

      if (ex.type === 'fill_in_the_blanks') {
        // Для "fill_in_the_blanks": distractors + correctAnswer
        const processed = items.map((item) => {
          const distractors =
            item.distractors?.filter(
              (d): d is string => typeof d === 'string',
            ) ?? [];
          const correct = item.correctAnswer ?? '';
          const options = [...distractors, correct].filter(
            (opt): opt is string => !!opt,
          );
          return { ...item, options };
        });
        enrichedExercises.push({ ...ex, items: processed });
      } else if (
        ex.type === 'multiple_choice' ||
        ex.type === 'matching_pairs'
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
          let options: string[] = [];
          const correct = item.correctAnswer ?? '';

          if (ex.type === 'multiple_choice') {
            const all = [...new Set([...poolWords, correct])].filter(
              (opt): opt is string => !!opt,
            );
            options = all;
          } else if (ex.type === 'matching_pairs') {
            options = poolWords;
          }

          return { ...item, options };
        });

        enrichedExercises.push({ ...ex, items: processed });
      } else {
        // open_question, flashcards и т.п.
        enrichedExercises.push({ ...ex, items });
      }
    }

    return {
      ...article,
      themeRu: article.theme?.name_ru || null,
      exercises: enrichedExercises,
    };
  }
}
