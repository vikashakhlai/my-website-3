import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Media } from 'src/media/media.entity';

@Entity('dialogue_groups')
export class DialogueGroup {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 200 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'base_language', default: 'fusha' })
  baseLanguage!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  /** 🔗 Связанные медиа (видео/аудио/тексты для фусхи и диалектов) */
  @OneToMany(() => Media, (media) => media.dialogueGroup)
  medias!: Media[];
}
