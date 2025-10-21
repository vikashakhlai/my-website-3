import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Book } from '../books/book.entity';

@Entity('authors')
export class Author {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  full_name!: string;

  @Column({ type: 'text' })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  bio!: string;

  @Column({ type: 'text', nullable: true })
  photo_url!: string;

  // 🔗 Связь многие-ко-многим с книгами
  @ManyToMany(() => Book, (book) => book.authors)
  books!: Book[];
}
