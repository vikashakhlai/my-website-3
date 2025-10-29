import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Comment } from 'src/comments/comment.entity';
import { Rating } from 'src/ratings/rating.entity';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum AccessLevel {
  BASIC = 'BASIC',
  ADVANCED = 'ADVANCED',
  PREMIUM = 'PREMIUM',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  @Column({ default: false })
  isAuthor!: boolean;

  @Column({
    type: 'enum',
    enum: AccessLevel,
    default: AccessLevel.BASIC,
  })
  accessLevel!: AccessLevel;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // === Связи ===
  @OneToMany(() => Comment, (comment) => comment.user, { cascade: true })
  comments!: Comment[];

  @OneToMany(() => Rating, (rating) => rating.user, { cascade: true })
  ratings!: Rating[];
}
