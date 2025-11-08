import { Exercise } from 'src/articles/entities/exercise.entity';
import { Dialect } from 'src/dialect/dialect.entity';
import { DialectTopic } from 'src/dialect_topics/dialect_topics.entity';
import { DialogueGroup } from 'src/dialogue/dialogue_group.entity';
import { DialogueScript } from 'src/dialogue/dialogue_script.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('media')
@Index(['dialectId'])
@Index(['createdAt'])
@Index(['type'])
export class Media {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'media_url', type: 'varchar', length: 500, nullable: true })
  mediaUrl?: string | null;

  @Column({
    type: 'enum',
    enum: ['video', 'audio', 'text'],
    default: 'video',
  })
  type!: 'video' | 'audio' | 'text';

  @Column({ type: 'varchar', length: 300 })
  title!: string;

  @Column({ nullable: true })
  previewUrl?: string;

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

  @Column({
    type: 'enum',
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  })
  level!: 'beginner' | 'intermediate' | 'advanced';

  @Column({ type: 'jsonb', nullable: true })
  resources?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'dialect_id', type: 'int', nullable: true })
  dialectId?: number | null;

  @ManyToOne(() => Dialect, (dialect) => dialect.medias, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'dialect_id' })
  dialect?: Dialect | null;

  @Column({
    name: 'license_type',
    type: 'varchar',
    length: 50,
    default: 'public',
  })
  licenseType!: string;

  @Column({
    name: 'license_author',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  licenseAuthor?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  duration?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  speaker?: string;

  @Column({ name: 'source_role', type: 'varchar', length: 100, nullable: true })
  sourceRole?: string;

  @ManyToOne(() => DialogueGroup, (group) => group.medias, { nullable: true })
  @JoinColumn({ name: 'dialogue_group_id' })
  dialogueGroup?: DialogueGroup | null;

  @Column({ name: 'dialogue_group_id', type: 'int', nullable: true })
  dialogueGroupId?: number | null;

  @OneToMany(() => DialogueScript, (script) => script.media)
  scripts?: DialogueScript[];

  @OneToMany(() => Exercise, (exercise) => exercise.media)
  exercises?: Exercise[];

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
