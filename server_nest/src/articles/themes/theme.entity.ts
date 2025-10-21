import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Article } from 'src/articles/article.entity';

@Entity('themes')
export class Theme {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'text' })
  name_ru?: string;

  @Column({ type: 'text' })
  name_ar?: string;

  @Column({ type: 'text' })
  slug?: string;

  @OneToMany(() => Article, (article) => article.theme)
  articles?: Article[];
}
