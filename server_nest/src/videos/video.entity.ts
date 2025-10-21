import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Dialect } from './dialect.entity';

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn()
  id!: number;

  /** 🎥 Ссылка на видео (например: Cloudinary, S3, YouTube, TikTok, MP4 URL) */
  @Column({ name: 'video_url', type: 'varchar', length: 500 })
  video_url!: string;

  /** 🗣️ Название или краткое описание */
  @Column({ type: 'varchar', length: 300 })
  title!: string;

  /** 💬 Субтитры (JSON или text) */
  @Column({ type: 'jsonb', nullable: true })
  subtitles?: {
    lang: string; // ar / ru / en
    text: string; // можно хранить srt или простые строки
  }[];

  /** 🧭 Ссылка на грамматический разбор или комментарий */
  @Column({
    name: 'grammar_link',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  grammar_link?: string;

  /** 📚 Полезные материалы / ссылки / литература */
  @Column({ type: 'jsonb', nullable: true })
  resources?: {
    label: string;
    url: string;
  }[];

  /** 🏳️ Диалект видео */
  @ManyToOne(() => Dialect, (dialect) => dialect.videos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'dialect_id' })
  dialect!: Dialect;

  /** Время создания */
  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  /** Время обновления */
  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}
