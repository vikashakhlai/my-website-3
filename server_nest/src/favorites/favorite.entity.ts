import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/user/user.entity';
import { TargetType } from 'src/common/enums/target-type.enum';

@Index(['userId', 'targetType', 'targetId'], { unique: true })
@Entity('favorites')
export class Favorite {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'target_type', type: 'varchar', length: 50 })
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
