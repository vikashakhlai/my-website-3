import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Comment } from './comment.entity';
import { User } from 'src/user/user.entity';

@Entity('comment_reactions')
@Unique('uq_comment_reaction', ['comment_id', 'user_id'])
export class CommentReaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  comment_id!: number;

  @Column()
  user_id!: string;

  @Column({ type: 'int' }) // 1 = like, -1 = dislike
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
