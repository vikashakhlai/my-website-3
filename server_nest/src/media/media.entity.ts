import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Exercise } from 'src/articles/entities/exercise.entity';
import { Dialect } from 'src/dialect/dialect.entity';
import { DialectTopic } from 'src/dialect_topics/dialect_topics.entity';
import { DialogueGroup } from 'src/dialogue/dialogue_group.entity';
import { DialogueScript } from 'src/dialogue/dialogue_script.entity';

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn()
  id!: number;

  /** 🎬 Путь к видео или аудио */
  @Column({ name: 'media_url', type: 'varchar', length: 500, nullable: true })
  mediaUrl?: string | null;

  /** 📄 Тип контента */
  @Column({
    type: 'enum',
    enum: ['video', 'audio', 'text'],
    default: 'video',
  })
  type!: 'video' | 'audio' | 'text';

  /** 🏷 Название */
  @Column({ type: 'varchar', length: 300 })
  title!: string;

  /** 🖼 Превью */
  @Column({ nullable: true })
  previewUrl?: string;

  /** 🎧 Субтитры */
  @Column({
    name: 'subtitles_link',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  subtitlesLink?: string;

  /** 📚 Ссылка на грамматику */
  @Column({
    name: 'grammar_link',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  grammarLink?: string;

  /** 📊 Уровень сложности */
  @Column({
    type: 'enum',
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  })
  level!: 'beginner' | 'intermediate' | 'advanced';

  /** 📦 Дополнительные материалы */
  @Column({ type: 'jsonb', nullable: true })
  resources?: Record<string, any>;

  /** 📅 Метаданные */
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  /** 🌍 Диалект (если это не фусха) */
  @Column({ name: 'dialect_id', type: 'int', nullable: true })
  dialectId?: number | null;

  @ManyToOne(() => Dialect, (dialect) => dialect.medias, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'dialect_id' })
  dialect?: Dialect | null;

  /** 🔒 Тип лицензии */
  @Column({
    name: 'license_type',
    type: 'varchar',
    length: 50,
    default: 'public',
  })
  licenseType!: string;

  /** 👤 Автор / источник */
  @Column({
    name: 'license_author',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  licenseAuthor?: string;

  /** 🕓 Длительность записи */
  @Column({ type: 'varchar', length: 20, nullable: true })
  duration?: string;

  /** 🗣 Говорящий */
  @Column({ type: 'varchar', length: 200, nullable: true })
  speaker?: string;

  /** 🤝 Роль / источник (для подписи "предоставлено", "создано") */
  @Column({ name: 'source_role', type: 'varchar', length: 100, nullable: true })
  sourceRole?: string;

  /** 💬 Группа диалогов (фусха + диалекты) */
  @ManyToOne(() => DialogueGroup, (group) => group.medias, { nullable: true })
  @JoinColumn({ name: 'dialogue_group_id' })
  dialogueGroup?: DialogueGroup | null;

  @Column({ name: 'dialogue_group_id', type: 'int', nullable: true })
  dialogueGroupId?: number | null;

  /** 🧾 Скрипты (тексты, переводы и субтитры) */
  @OneToMany(() => DialogueScript, (script) => script.media)
  scripts?: DialogueScript[];

  /** 🧩 Упражнения */
  @OneToMany(() => Exercise, (exercise) => exercise.media)
  exercises?: Exercise[];

  /** 🏷 Темы */
  @ManyToMany(() => DialectTopic, (topic) => topic.medias, {
    cascade: true,
  })
  @JoinTable({
    name: 'media_topics',
    joinColumn: { name: 'media_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'topic_id', referencedColumnName: 'id' },
  })
  topics?: DialectTopic[];
}
