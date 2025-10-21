import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Theme } from './themes/theme.entity';
import { Exercise } from './entities/exercise.entity';
import { Personality } from 'src/personalities/personality.entity';

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'title_ru', type: 'varchar', length: 500, nullable: true })
  titleRu?: string;

  @Column({ name: 'title_ar', type: 'varchar', length: 500, nullable: true })
  titleAr?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl?: string;

  @Column({ name: 'video_url', type: 'varchar', length: 500, nullable: true })
  videoUrl?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt?: Date;

  // 🔗 Связь с темой
  @ManyToOne(() => Theme, (theme) => theme.articles, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'theme_id' })
  theme?: Theme;

  // ⚙️ Не обязательно хранить отдельный themeId,
  // но если нужно для фильтрации — оставляем.
  @Column({ name: 'theme_id', type: 'int', nullable: true })
  themeId?: number | null;

  // 📚 Упражнения, связанные со статьёй
  @OneToMany(() => Exercise, (exercise) => exercise.article, {
    cascade: ['insert', 'update'],
  })
  exercises?: Exercise[];

  @ManyToMany(() => Personality, (p) => p.articles)
  personalities!: Personality[];
}
