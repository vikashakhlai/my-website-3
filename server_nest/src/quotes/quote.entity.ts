import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Personality } from 'src/personalities/personality.entity';

@Entity('quotes')
export class Quote {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  text_ar!: string;

  @Column({ type: 'text', nullable: true })
  text_ru!: string | null;

  @ManyToOne(() => Personality, (personality) => personality.quotes, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'personality_id' })
  personality!: Personality;
}
