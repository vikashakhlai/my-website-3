import { Role } from 'src/auth/roles.enum';
import { Comment } from 'src/comments/comment.entity';
import { Rating } from 'src/ratings/rating.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AccessLevel {
  BASIC = 'BASIC',
  ADVANCED = 'ADVANCED',
  PREMIUM = 'PREMIUM',
}

@Entity('users')
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 254 })
  email!: string;

  @Column({ select: false, length: 128 })
  password!: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role!: Role;

  @Column({ default: false })
  isAuthor!: boolean;

  @Column({
    type: 'enum',
    enum: AccessLevel,
    default: AccessLevel.BASIC,
  })
  accessLevel!: AccessLevel;

  @Column({ type: 'text', nullable: true })
  refreshTokenHash?: string; // ← изменено на ?string

  @Column({ nullable: true })
  refreshTokenUserId?: string;

  @Column({ nullable: true })
  refreshTokenUserAgent?: string;

  @Column({ nullable: true })
  refreshTokenIp?: string;

  @Column({ nullable: true })
  refreshTokenExp?: Date;

  @Column({ type: 'bigint', nullable: true })
  tokenVersion?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Comment, (comment) => comment.user, { cascade: true })
  comments!: Comment[];

  @OneToMany(() => Rating, (rating) => rating.user, { cascade: true })
  ratings!: Rating[];
}
