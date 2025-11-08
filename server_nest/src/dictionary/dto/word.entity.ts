import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsageExample } from '../entities/usage-example.entity';
import { VerbForm } from '../entities/verb-form.entity';

@Entity({ name: 'words' })
@Index(['root_ar']) // ✅ Для быстрого поиска по корню
@Index(['word_ar_normalized']) // ✅ Для поиска по слову
export class Word {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', name: 'word_ar' })
  word_ar!: string;

  @Column({ type: 'text', name: 'word_ar_normalized', nullable: true })
  word_ar_normalized!: string;

  @Column({ type: 'text', name: 'word_ru', nullable: true })
  word_ru!: string;

  @Column({ type: 'varchar', length: 10, name: 'root_ar', nullable: true })
  root_ar!: string;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'part_of_speech',
    nullable: true,
  })
  part_of_speech!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  created_at?: Date;

  @OneToMany(() => VerbForm, (vf) => vf.word)
  verb_forms?: VerbForm[];

  @OneToMany(() => UsageExample, (ue) => ue.word)
  usage_examples?: UsageExample[];
}
