import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('textbooks')
export class Textbook {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  cover_image_url?: string;

  @Column({ type: 'text', nullable: true })
  authors?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'int', nullable: true })
  publication_year?: number;

  @Column({ length: 50, nullable: true })
  level?: string;

  @Column({ type: 'text', nullable: true })
  pdf_url?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
