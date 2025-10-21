import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Word } from './word.entity';

@Entity({ name: 'verb_forms' })
export class VerbForm {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', name: 'word_id' })
  word_id!: number;

  @ManyToOne(() => Word, (w) => w.verb_forms, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'word_id' })
  word!: Word;

  @Column({ type: 'smallint', name: 'form_number', nullable: true })
  form_number!: number;

  @Column({ type: 'text', name: 'form_ar', nullable: true })
  form_ar!: string;

  @Column({ type: 'text', name: 'meaning_ru', nullable: true })
  meaning_ru!: string;
}
