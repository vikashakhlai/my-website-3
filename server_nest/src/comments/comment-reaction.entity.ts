import { User } from 'src/user/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Comment } from './comment.entity';

@Entity('comment_reactions')
@Unique('uq_comment_reaction', ['comment_id', 'user_id'])
@Index(['comment_id'])
@Index(['user_id'])
export class CommentReaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  comment_id!: number;

  @Column()
  user_id!: string;

  @Column({ type: 'int' })
  value!: 1 | -1;

  @ManyToOne(() => Comment, (c) => c.replies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'comment_id' })
  comment!: Comment;

  @ManyToOne(() => User, (u) => u.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
