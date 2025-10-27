import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Media } from 'src/media/media.entity';

@Entity('dialogue_scripts')
export class DialogueScript {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Media, (media) => media.scripts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'media_id' })
  media!: Media;

  @Column({ name: 'text_original', type: 'text', nullable: false })
  textOriginal!: string;

  @Column({ name: 'text_translated', type: 'text', nullable: true })
  textTranslated?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
