import { Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Distractor } from './distractor.entity';

@Entity('distractor_pools')
export class DistractorPool {
  @PrimaryGeneratedColumn()
  id?: number;

  @OneToMany(() => Distractor, (distractor) => distractor.distractorPool)
  distractors?: Distractor[];
}
