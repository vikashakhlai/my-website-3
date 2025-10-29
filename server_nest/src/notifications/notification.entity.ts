import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from 'src/user/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  recipient!: User;

  @Column()
  recipient_id!: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  sender?: User;

  @Column({ nullable: true })
  sender_id?: string;

  @Column({
    type: 'text',
  })
  type!: 'comment_reply' | 'rating_reply' | 'like' | 'dislike';

  @Column({
    type: 'text',
  })
  entity_type!: 'comment' | 'rating';

  @Column({ type: 'int' })
  entity_id!: number;

  @Column({ type: 'text' })
  message!: string;

  @Column({ default: false })
  is_read!: boolean;

  @CreateDateColumn()
  created_at!: Date;
}
