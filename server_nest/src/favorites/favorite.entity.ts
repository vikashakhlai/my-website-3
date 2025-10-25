import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/user/user.entity';

/**
 * Перечисление допустимых типов избранного.
 * Расширяй по мере необходимости: 'media', 'book', 'article', 'textbook', ...
 */
export enum FavoriteItemType {
  BOOK = 'book',
  ARTICLE = 'article',
  TEXTBOOK = 'textbook',
  MEDIA = 'media', // ✅ заменили video → media
}

@Index(['userId', 'itemType', 'itemId'], { unique: true })
@Entity('favorites')
export class Favorite {
  @PrimaryGeneratedColumn()
  id!: number;

  // UUID пользователя (в базе — user_id)
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  /**
   * Тип избранного элемента
   * 'book' | 'article' | 'textbook' | 'media'
   */
  @Column({
    name: 'item_type',
    type: 'varchar',
    length: 50,
  })
  itemType!: FavoriteItemType | string;

  // ID элемента из соответствующей таблицы
  @Column({ name: 'item_id', type: 'int' })
  itemId!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  // связь с пользователем (user.id ожидается UUID/string)
  @ManyToOne(() => User, (user) => (user as any).favorites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user!: User;
}
