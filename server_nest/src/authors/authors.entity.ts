import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Book } from 'src/books/book.entity';

@Entity({ name: 'authors' })
export class Author {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Column({ name: 'full_name', type: 'varchar', nullable: true })
  fullName!: string;

  @Column({ name: 'bio', type: 'text', nullable: true })
  bio?: string | null;

  @Column({ name: 'photo_url', type: 'varchar', nullable: true })
  photoUrl?: string | null;

  @ManyToMany(() => Book, (book) => book.authors)
  books!: Book[];
}
