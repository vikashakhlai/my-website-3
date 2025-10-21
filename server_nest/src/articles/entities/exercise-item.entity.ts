import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exercise } from './exercise.entity';

@Entity('exercise_items')
export class ExerciseItem {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'int' })
  position?: number;

  @Column({ name: 'question_ru', type: 'text', nullable: true })
  questionRu?: string;

  @Column({ name: 'question_ar', type: 'text', nullable: true })
  questionAr?: string;

  @Column({ name: 'part_before', type: 'text', nullable: true })
  partBefore?: string;

  @Column({ name: 'part_after', type: 'text', nullable: true })
  partAfter?: string;

  @Column({ type: 'jsonb', nullable: true })
  distractors?: string[];

  @Column({ name: 'word_ar', type: 'varchar', length: 255, nullable: true })
  wordAr?: string;

  @Column({ name: 'word_ru', type: 'varchar', length: 255, nullable: true })
  wordRu?: string;

  @Column({
    name: 'correct_answer',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  correctAnswer?: string;

  @ManyToOne(() => Exercise, (exercise) => exercise.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'exercise_id' })
  exercise?: Exercise;

  @Column({ name: 'exercise_id' })
  exerciseId?: number;
}
