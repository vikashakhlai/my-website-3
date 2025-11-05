// src/user/user.entity.ts
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
import { Role } from 'src/auth/roles.enum';

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

  // ✅ Никогда не возвращаем пароль в API/QueryBuilder
  @Column({ select: false })
  password!: string;

  // ✅ Роли: USER / ADMIN / SUPER_ADMIN / TUTOR / etc
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

  // ✅ HASH от refresh-токена (cookie-based) — null после logoutAll
  @Column({ type: 'text', nullable: true })
  refreshTokenHash!: string | null;

  // ✅ Версия токена (инвалидирует ВСЕ access при logoutAll / смене пароля)
  @Column({ type: 'bigint', nullable: true })
  tokenVersion!: number | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // === Relations ===
  @OneToMany(() => Comment, (comment) => comment.user, { cascade: true })
  comments!: Comment[];

  @OneToMany(() => Rating, (rating) => rating.user, { cascade: true })
  ratings!: Rating[];
}
