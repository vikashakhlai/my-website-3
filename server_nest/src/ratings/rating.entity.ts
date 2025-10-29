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

@Entity('ratings')
export class Rating {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.ratings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' }) // ✅ Явно связываем с колонкой user_id
  user!: User;

  @Column()
  user_id!: string;

  @Column({
    type: 'text',
  })
  target_type!: 'book' | 'article' | 'media' | 'personality' | 'textbook';

  @Column()
  target_id!: number;

  @ManyToOne(() => Rating, (rating) => rating.replies, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'parent_id' }) // ✅ То же самое для parent_id
  parent?: Rating;

  @OneToMany(() => Rating, (rating) => rating.parent)
  replies!: Rating[];

  @Column({ type: 'int', default: 0 })
  value!: number;

  @Column({ type: 'int', default: 0 })
  likes_count!: number;

  @Column({ type: 'int', default: 0 })
  dislikes_count!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
