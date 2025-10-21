import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Article } from 'src/articles/article.entity';
import { Book } from '../books/book.entity';
import { Quote } from 'src/quotes/quote.entity';

export enum Era {
  PRE_ISLAMIC = 'pre_islamic', // Доисламский
  RASHIDUN = 'rashidun', // Праведные халифы
  UMAYYAD = 'umayyad', // Омейяды
  ABBASID = 'abbasid', // Аббасиды
  AL_ANDALUS = 'al_andalus', // Аль-Андалус
  OTTOMAN = 'ottoman', // Османы
  MODERN = 'modern', // Современность
}

@Entity('personalities')
export class Personality {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  name!: string;

  @Column({ length: 50, nullable: true })
  years?: string;

  @Column({ length: 255, nullable: true })
  position?: string;

  @Column({ type: 'text', array: true, nullable: true })
  facts?: string[];

  @Column({ type: 'text', nullable: true })
  biography?: string;

  @Column({ name: 'image_url', length: 512, nullable: true })
  imageUrl?: string;

  @Column({ type: 'varchar', nullable: true })
  era?: Era;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // === связи ===
  @ManyToMany(() => Article, (article) => article.personalities, {
    eager: false,
  })
  @JoinTable({
    name: 'personality_articles',
    joinColumn: { name: 'personality_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'article_id', referencedColumnName: 'id' },
  })
  articles!: Article[];

  @ManyToMany(() => Book, (book) => book.personalities, { eager: false })
  @JoinTable({
    name: 'personality_books',
    joinColumn: { name: 'personality_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'book_id', referencedColumnName: 'id' },
  })
  books!: Book[];

  @OneToMany(() => Quote, (quote) => quote.personality)
  quotes!: Quote[];
}
