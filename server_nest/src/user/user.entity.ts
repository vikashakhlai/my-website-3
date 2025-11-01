// src/users/user.entity.ts
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
import { Role } from 'src/auth/roles.enum'; // ✅ общий enum ролей

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

  // ✅ Не возвращаем пароль по умолчанию из запросов (утечки / автосериализация)
  @Column({ select: false })
  password!: string;

  // ✅ Используем общий enum ролей, добавлен TUTOR
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
