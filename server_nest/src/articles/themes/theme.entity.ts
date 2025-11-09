import { Article } from 'src/articles/article.entity';
import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('themes')
@Index(['slug'])
export class Theme {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'text' })
  name_ru?: string;

  @Column({ type: 'text' })
  name_ar?: string;

  @Column({ type: 'text', unique: true })
  slug?: string;

  @OneToMany(() => Article, (article) => article.theme)
  articles?: Article[];
}
