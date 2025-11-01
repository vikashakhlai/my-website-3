import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/user/user.entity';
import { TargetType } from 'src/common/enums/target-type.enum';

@Entity('ratings')
export class Rating {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' }) // <-- вручную указываем имя FK
  user!: User;

  @Column()
  user_id!: string; // <-- это теперь FK и единственное поле

  @Column({ type: 'enum', enum: TargetType })
  target_type!: TargetType;

  @Column()
  target_id!: number;

  @Column({ type: 'int' })
  value!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
