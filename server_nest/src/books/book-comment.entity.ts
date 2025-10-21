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
import { User } from 'src/user/user.entity';

@Entity('book_comments')
export class BookComment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('uuid')
  user_id!: string;

  @Column()
  book_id!: number;

  // ✅ Указываем тип 'int', иначе TypeORM подумает, что это объект
  @Column({ type: 'int', nullable: true })
  parent_id?: number | null;

  @Column('text')
  content!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // ✅ Связь с книгой
  @ManyToOne(() => Book, (book) => book.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'book_id' })
  book!: Book;

  // ✅ Связь с пользователем
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
