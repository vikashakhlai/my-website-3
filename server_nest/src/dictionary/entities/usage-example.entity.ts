import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Word } from './word.entity';

@Entity({ name: 'usage_examples' })
@Index(['word_id']) // ✅ Для быстрого поиска по слову
export class UsageExample {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', name: 'word_id' })
  word_id!: number;

  @ManyToOne(() => Word, (w) => w.usage_examples, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'word_id' })
  word!: Word;

  @Column({ type: 'varchar', length: 20, name: 'example_type', nullable: true })
  example_type!: string;

  @Column({ type: 'text', name: 'text_ar', nullable: true })
  text_ar!: string;

  @Column({ type: 'text', name: 'text_ru', nullable: true })
  text_ru!: string;

  @Column({ type: 'text', name: 'context', nullable: true })
  context!: string;
}
