import { Article } from 'src/articles/article.entity';
import { Media } from 'src/media/media.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DistractorPool } from './distractor-pool.entity';
import { ExerciseItem } from './exercise-item.entity';
import { ExerciseType } from './exercise-type.enum';

@Entity('exercises')
export class Exercise {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  type?: ExerciseType;

  @Column({ name: 'instruction_ru', type: 'text', nullable: true })
  instructionRu?: string;

  @Column({ name: 'instruction_ar', type: 'text', nullable: true })
  instructionAr?: string;

  @ManyToOne(() => Article, (article) => article.exercises, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'article_id' })
  article?: Article;

  @Column({ name: 'article_id', nullable: true })
  articleId?: number;

  @ManyToOne(() => Media, (media) => media.exercises, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'media_id' })
  media?: Media;

  @Column({ name: 'media_id', nullable: true })
  mediaId?: number;

  @ManyToOne(() => DistractorPool, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'distractor_pool_id' })
  distractorPool?: DistractorPool;

  @Column({ name: 'distractor_pool_id', nullable: true })
  distractorPoolId?: number;

  @OneToMany(() => ExerciseItem, (item) => item.exercise, { cascade: true })
  items?: ExerciseItem[];
}
