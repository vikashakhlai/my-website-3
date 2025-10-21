import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DistractorPool } from './distractor-pool.entity';

@Entity('distractors')
export class Distractor {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'text', nullable: true })
  word?: string;

  @Column({ name: 'distractor_pool_id', type: 'int', nullable: false })
  distractorPoolId?: number;

  @ManyToOne(() => DistractorPool, (pool) => pool.distractors, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'distractor_pool_id' })
  distractorPool?: DistractorPool;
}
