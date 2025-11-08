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
  UpdateDateColumn,
} from 'typeorm';

@Entity('ratings')
@Index(['target_type', 'target_id'])
@Index(['user_id', 'target_type', 'target_id'], { unique: true })
export class Rating {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({
    type: 'enum',
    enum: TargetType,
  })
  target_type!: TargetType;

  @Column({ type: 'int' })
  target_id!: number;

  @Column({ type: 'smallint' })
  value!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
