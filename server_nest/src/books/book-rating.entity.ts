import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Book } from './book.entity';
import { User } from 'src/user/user.entity'; // ✅ Добавляем импорт

@Entity('book_ratings')
export class BookRating {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('uuid')
  user_id!: string;

  @Column()
  book_id!: number;

  @Column('int')
  rating!: number; // 1–5

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // 🔗 Связь с книгой
  @ManyToOne(() => Book, (book) => book.ratings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'book_id' })
  book!: Book;

  // 🔗 Связь с пользователем (вот её не хватало)
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
