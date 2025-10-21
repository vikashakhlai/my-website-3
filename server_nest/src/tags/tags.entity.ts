import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Book } from '../books/book.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', unique: true })
  name!: string;

  // 🔗 Связь многие-ко-многим с книгами
  @ManyToMany(() => Book, (book) => book.tags)
  books!: Book[];
}
