import { Media } from 'src/media/media.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('dialogue_scripts')
export class DialogueScript {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Media, (media) => media.scripts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'media_id' })
  media!: Media;

  @Column({ name: 'text_original', type: 'text', nullable: false })
  textOriginal!: string;

  @Column({
    name: 'speaker_name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  speakerName?: string | null;

  @Column({ name: 'order_index', type: 'int', nullable: true })
  orderIndex?: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
