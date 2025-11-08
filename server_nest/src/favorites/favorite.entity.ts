import { TargetType } from 'src/common/enums/target-type.enum';
import { User } from 'src/user/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Index(['userId', 'targetType', 'targetId'], { unique: true })
@Index(['userId']) // ✅ Для быстрого поиска по пользователю
@Index(['targetType', 'targetId']) // ✅ Для быстрого поиска по цели
@Entity('favorites')
export class Favorite {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({
    name: 'target_type',
    type: 'enum',
    enum: TargetType,
  })
  targetType!: TargetType;

  @Column({ name: 'target_id', type: 'int' })
  targetId!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => User, (user) => (user as any).favorites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user!: User;
}
