import { TargetType } from 'src/common/enums/target-type.enum';
import { User } from 'src/user/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('comments')
@Index(['target_type', 'target_id'])
@Index(['user_id'])
@Index(['parent_id'])
export class Comment {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({ type: 'enum', enum: TargetType })
  target_type!: TargetType;

  @Column({ type: 'int' })
  target_id!: number;

  @Column('text')
  content!: string;

  @Column({ type: 'int', default: 0 })
  likes_count!: number;

  @Column({ type: 'int', default: 0 })
  dislikes_count!: number;

  @ManyToOne(() => Comment, (comment) => comment.replies, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'parent_id' })
  parent?: Comment | null;

  @Column({ type: 'int', nullable: true })
  parent_id!: number | null;

  @OneToMany(() => Comment, (comment) => comment.parent)
  replies!: Comment[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
