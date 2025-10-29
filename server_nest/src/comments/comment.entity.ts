import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/user/user.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id!: number;

  // 👤 Пользователь, оставивший комментарий
  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  // Храним UUID напрямую для удобства
  @Column({ type: 'uuid' })
  user_id!: string;

  // 🎯 Тип сущности, к которой привязан комментарий
  @Column({
    type: 'text',
  })
  target_type!: 'book' | 'article' | 'media' | 'personality' | 'textbook';

  // 🔗 ID конкретной сущности
  @Column({ type: 'int' })
  target_id!: number;

  // 💬 Текст комментария
  @Column('text')
  content!: string;

  // 📈 Лайки / дизлайки
  @Column({ type: 'int', default: 0 })
  likes_count!: number;

  @Column({ type: 'int', default: 0 })
  dislikes_count!: number;

  // 🔁 Родительский комментарий
  @ManyToOne(() => Comment, (comment) => comment.replies, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'parent_id' })
  parent?: Comment | null;

  // Храним parent_id явно для простоты SQL-запросов
  @Column({ type: 'int', nullable: true })
  parent_id!: number | null;

  // 👇 Ответы на этот комментарий
  @OneToMany(() => Comment, (comment) => comment.parent)
  replies!: Comment[];

  // 🕒 Даты
  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
