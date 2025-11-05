// src/user/user.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, AccessLevel } from './user.entity';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/auth/roles.enum';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ✅ Новый универсальный update (нужен для AuthService)
  async update(id: string, data: Partial<User>): Promise<void> {
    await this.userRepository.update({ id }, data);
  }

  // 🔹 Создание пользователя (всегда USER, без внешней роли)
  async create(email: string, password: string): Promise<User> {
    if (!email || !password) {
      throw new BadRequestException('Email и пароль обязательны');
    }

    const existing = await this.findByEmail(email);
    if (existing) {
      throw new BadRequestException(
        'Пользователь с таким email уже существует',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      role: Role.USER,
      isAuthor: false,
      accessLevel: AccessLevel.BASIC,
    });

    return this.userRepository.save(user);
  }

  // 🔹 Получение всех пользователей (для ADMIN+)
  async findAll(): Promise<Partial<User>[]> {
    return this.userRepository.find({
      select: [
        'id',
        'email',
        'role',
        'isAuthor',
        'accessLevel',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  // 🔹 Поиск пользователя по ID (пароль не возвращается 💡)
  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    return user;
  }

  // 🔹 Поиск по email без пароля
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  // 🔹 Поиск по email + пароль (используется только при логине)
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'password',
        'role',
        'isAuthor',
        'accessLevel',
        'createdAt',
        'updatedAt',
        'refreshTokenHash',
        'tokenVersion',
      ],
    });
  }

  // 🔹 Проверка пароля
  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // 🔹 Повышение до ADMIN (только SUPER_ADMIN)
  async promoteToAdmin(userId: string): Promise<User> {
    const user = await this.findById(userId);
    if (user.role === Role.SUPER_ADMIN) {
      throw new BadRequestException('Нельзя менять роль SUPER_ADMIN');
    }
    user.role = Role.ADMIN;
    return this.userRepository.save(user);
  }

  // 🔹 Отзыв прав ADMIN (только SUPER_ADMIN)
  async revokeAdminRights(userId: string): Promise<User> {
    const user = await this.findById(userId);
    if (user.role !== Role.ADMIN) {
      throw new BadRequestException('Пользователь не является ADMIN');
    }
    user.role = Role.USER;
    return this.userRepository.save(user);
  }

  // 🔹 Назначение автора (ADMIN или SUPER_ADMIN)
  async makeAuthor(userId: string): Promise<User> {
    const user = await this.findById(userId);
    if (user.isAuthor) return user;
    user.isAuthor = true;
    return this.userRepository.save(user);
  }

  // 🔹 Удаление пользователя (только SUPER_ADMIN)
  async deleteUser(userId: string): Promise<{ message: string }> {
    const user = await this.findById(userId);
    if (user.role === Role.SUPER_ADMIN) {
      throw new BadRequestException('Нельзя удалить SUPER_ADMIN');
    }
    await this.userRepository.remove(user);
    return { message: `User ${user.email} has been deleted` };
  }

  // 🔹 Обновление email/пароля (SELF или ADMIN+)
  async updateUser(userId: string, updateDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(userId);

    if (updateDto.email) user.email = updateDto.email;
    if (updateDto.password)
      user.password = await bcrypt.hash(updateDto.password, 10);

    await this.userRepository.save(user);
    return user;
  }
}
