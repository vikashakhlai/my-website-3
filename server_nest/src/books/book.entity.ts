import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  ManyToOne,
  OneToMany,
  JoinTable,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Author } from '../authors/authors.entity';
import { Tag } from '../tags/tags.entity';
import { BookComment } from './book-comment.entity';
import { BookRating } from './book-rating.entity';
import { Publisher } from '../publishers/publisher.entity'; // ✅ лучше без абсолютного пути 'src/...'
import { Personality } from 'src/personalities/personality.entity';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'int', nullable: true })
  publication_year!: number | null;

  @Column({ type: 'text', nullable: true })
  cover_url!: string | null;

  @Column({ type: 'int', nullable: true })
  pages!: number | null;

  @Column({ type: 'int', nullable: true })
  publisher_id!: number | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  // 🔗 Авторы — связь многие ко многим
  @ManyToMany(() => Author, (author) => author.books, { cascade: true })
  @JoinTable({
    name: 'book_authors',
    joinColumn: { name: 'book_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'author_id', referencedColumnName: 'id' },
  })
  authors!: Author[];

  // 🔗 Теги — связь многие ко многим
  @ManyToMany(() => Tag, (tag) => tag.books, { cascade: true })
  @JoinTable({
    name: 'book_tags',
    joinColumn: { name: 'book_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags!: Tag[];

  // 💬 Комментарии
  @OneToMany(() => BookComment, (comment) => comment.book)
  comments!: BookComment[];

  // ⭐ Оценки
  @OneToMany(() => BookRating, (rating) => rating.book)
  ratings!: BookRating[];

  // 🏢 Издательство (многие книги могут иметь одно издательство)
  @ManyToOne(() => Publisher, (publisher) => publisher.books, {
    onDelete: 'SET NULL', // ✅ если издательство удалят, книга не пропадёт
  })
  @JoinColumn({ name: 'publisher_id' })
  publisher!: Publisher | null;

  @ManyToMany(() => Personality, (p) => p.books)
  personalities!: Personality[];
}
