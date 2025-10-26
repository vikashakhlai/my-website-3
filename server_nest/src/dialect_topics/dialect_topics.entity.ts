import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Media } from 'src/media/media.entity';

@Entity('dialect_topics')
export class DialectTopic {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string;

  @ManyToMany(() => Media, (media) => media.topics)
  medias!: Media[];
}
