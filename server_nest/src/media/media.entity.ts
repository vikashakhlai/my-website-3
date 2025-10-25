import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exercise } from 'src/articles/entities/exercise.entity';

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'media_url', type: 'varchar', length: 500 })
  mediaUrl!: string;

  @Column({ type: 'enum', enum: ['video', 'audio'], default: 'video' })
  type!: 'video' | 'audio';

  @Column({ type: 'varchar', length: 300 })
  title!: string;

  @Column({
    name: 'subtitles_link',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  subtitlesLink?: string;

  @Column({
    name: 'grammar_link',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  grammarLink?: string;

  @Column({ type: 'jsonb', nullable: true })
  resources?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  /** 🔗 ID диалекта */
  @Column({ name: 'dialect_id', type: 'int' })
  dialectId!: number;

  /** 🔒 Тип лицензии: public | cc-by | cc-by-sa | private | custom */
  @Column({
    name: 'license_type',
    type: 'varchar',
    length: 50,
    default: 'public',
  })
  licenseType!: string;

  /** 👤 Автор / источник, если лицензия требует указания */
  @Column({
    name: 'license_author',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  licenseAuthor?: string;

  // связь с упражнениями
  @OneToMany(() => Exercise, (exercise) => exercise.media)
  exercises?: Exercise[];
}
