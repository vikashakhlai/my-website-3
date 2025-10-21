import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, AccessLevel } from './user.entity';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 🔹 Создание пользователя
  async create(
    email: string,
    password: string,
    role: UserRole = UserRole.USER,
    isAuthor = false,
    accessLevel: AccessLevel = AccessLevel.BASIC,
  ): Promise<User> {
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
      role,
      isAuthor,
      accessLevel,
    });

    return this.userRepository.save(user);
  }

  // 🔹 Получение всех пользователей
  async findAll(): Promise<Partial<User>[]> {
    return this.userRepository.find({
      select: ['id', 'email', 'role', 'isAuthor', 'accessLevel', 'createdAt'],
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // 🔹 Повышение до администратора
  async promoteToAdmin(userId: string, requesterRole: UserRole): Promise<User> {
    if (requesterRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Only SUPER_ADMIN can promote users to ADMIN',
      );
    }

    const user = await this.findById(userId);

    if (user.role === UserRole.SUPER_ADMIN) {
      throw new BadRequestException('Cannot change SUPER_ADMIN role');
    }

    user.role = UserRole.ADMIN;
    return this.userRepository.save(user);
  }

  // 🔹 Отзыв прав администратора
  async revokeAdminRights(
    userId: string,
    requesterRole: UserRole,
  ): Promise<User> {
    if (requesterRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only SUPER_ADMIN can revoke admin rights');
    }

    const user = await this.findById(userId);

    if (user.role === UserRole.SUPER_ADMIN) {
      throw new BadRequestException('Cannot change SUPER_ADMIN role');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new BadRequestException('User is not an admin');
    }

    user.role = UserRole.USER;
    return this.userRepository.save(user);
  }

  // 🔹 Назначение автора
  async makeAuthor(userId: string, requesterRole: UserRole): Promise<User> {
    if (
      requesterRole !== UserRole.ADMIN &&
      requesterRole !== UserRole.SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        'Only ADMIN or SUPER_ADMIN can assign author status',
      );
    }

    const user = await this.findById(userId);

    if (user.isAuthor) {
      return user;
    }

    user.isAuthor = true;
    return this.userRepository.save(user);
  }

  // 🔹 Удаление пользователя
  async deleteUser(
    userId: string,
    requesterRole: UserRole,
  ): Promise<{ message: string }> {
    if (requesterRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only SUPER_ADMIN can delete users');
    }

    const user = await this.findById(userId);

    if (user.role === UserRole.SUPER_ADMIN) {
      throw new BadRequestException('Cannot delete a SUPER_ADMIN');
    }

    await this.userRepository.remove(user);
    return { message: `User ${user.email} has been deleted` };
  }

  // 🔹 Обновление пользователя
  async updateUser(
    userId: string,
    updateDto: UpdateUserDto,
    requesterRole: UserRole,
  ): Promise<User> {
    const user = await this.findById(userId);

    // Проверка прав
    if (
      requesterRole !== UserRole.ADMIN &&
      requesterRole !== UserRole.SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        'Недостаточно прав для обновления пользователя',
      );
    }

    if (updateDto.role && requesterRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Только SUPER_ADMIN может менять роли пользователей',
      );
    }

    // Применение обновлений
    if (updateDto.email) user.email = updateDto.email;
    if (updateDto.password)
      user.password = await bcrypt.hash(updateDto.password, 10);
    if (typeof updateDto.isAuthor === 'boolean')
      user.isAuthor = updateDto.isAuthor;
    if (updateDto.role) user.role = updateDto.role;
    if (updateDto.accessLevel) user.accessLevel = updateDto.accessLevel;

    await this.userRepository.save(user);
    return user;
  }
}
