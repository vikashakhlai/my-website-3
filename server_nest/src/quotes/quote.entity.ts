import { Personality } from 'src/personalities/personality.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('quotes')
export class Quote {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  text_ar!: string;

  @Column({ type: 'text', nullable: true })
  text_ru!: string | null;

  @Column({ name: 'personality_id', nullable: true })
  personality_id!: number | null;

  @ManyToOne(() => Personality, (personality) => personality.quotes, {
    onDelete: 'CASCADE',
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'personality_id' })
  personality!: Personality | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
