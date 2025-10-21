import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Article } from 'src/articles/article.entity';
import { ExerciseItem } from './exercise-item.entity';
import { DistractorPool } from './distractor-pool.entity';
import { ExerciseType } from './exercise-type.enum';

@Entity('exercises')
export class Exercise {
  @PrimaryGeneratedColumn()
  id!: number;

  // Храним строку, используем Enum только в TypeScript
  @Column({ type: 'varchar', length: 50, nullable: true })
  type?: ExerciseType;

  @Column({ name: 'instruction_ru', type: 'text', nullable: true })
  instructionRu?: string;

  @Column({ name: 'instruction_ar', type: 'text', nullable: true })
  instructionAr?: string;

  @ManyToOne(() => Article, (article) => article.exercises, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'article_id' })
  article?: Article;

  @Column({ name: 'article_id' })
  articleId!: number;

  @ManyToOne(() => DistractorPool, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'distractor_pool_id' })
  distractorPool?: DistractorPool;

  @Column({ name: 'distractor_pool_id', nullable: true })
  distractorPoolId?: number;

  @OneToMany(() => ExerciseItem, (item) => item.exercise, { cascade: true })
  items?: ExerciseItem[];
}
