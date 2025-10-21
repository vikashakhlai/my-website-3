import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Video } from '../videos/video.entity';

@Entity('dialects')
export class Dialect {
  @PrimaryGeneratedColumn()
  id!: number;

  /** Название (например: Египетский, Сирийский, Иракский...) */
  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string;

  /** Короткий slug для URL (например: egyptian, syrian, iraqi...) */
  @Column({ type: 'varchar', length: 100, unique: true })
  slug!: string;

  /** Описание / особенности */
  @Column({ type: 'text', nullable: true })
  description?: string;

  /** Связанные видео */
  @OneToMany(() => Video, (video) => video.dialect)
  videos!: Video[];

  /** Дата создания */
  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  /** Дата обновления */
  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}
