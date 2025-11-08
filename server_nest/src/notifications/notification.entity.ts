import { User } from 'src/user/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('notifications')
@Index(['recipient_id', 'created_at'])
@Index(['recipient_id', 'is_read'])
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  recipient!: User;

  @Column({ type: 'uuid' })
  recipient_id!: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  sender?: User;

  @Column({ type: 'uuid', nullable: true })
  sender_id?: string;

  @Column({
    type: 'enum',
    enum: ['comment_reply', 'rating_reply', 'like', 'dislike'],
  })
  type!: 'comment_reply' | 'rating_reply' | 'like' | 'dislike';

  @Column({
    type: 'enum',
    enum: ['comment', 'rating'],
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
