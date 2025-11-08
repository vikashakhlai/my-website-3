import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/auth/roles.enum';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserAdminListDto } from './dto/user-admin-list.dto';
import { AccessLevel, User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAllForAdmin(): Promise<UserAdminListDto[]> {
    try {
      const users = await this.userRepository.find({
        select: [
          'id',
          'email',
          'role',
          'isAuthor',
          'accessLevel',
          'createdAt',
          'updatedAt',
        ],
        order: { createdAt: 'ASC' },
      });

      return users.map((user) => ({
        id: user.id,
        email: user.email,
        role: user.role,
        isAuthor: user.isAuthor,
        accessLevel: user.accessLevel,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));
    } catch (error: unknown) {
      throw new InternalServerErrorException(
        'Ошибка при получении списка пользователей',
      );
    }
  }

  async update(id: string, data: Partial<User>): Promise<void> {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new BadRequestException('ID пользователя не может быть пустым');
    }

    if (!data || Object.keys(data).length === 0) {
      throw new BadRequestException('Нет данных для обновления');
    }

    const result = await this.userRepository.update({ id }, data);

    if (result.affected === 0) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден`);
    }
  }

  async create(email: string, password: string): Promise<User> {
    if (!email || typeof email !== 'string' || email.trim() === '') {
      throw new BadRequestException('Email обязателен и должен быть строкой');
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      throw new BadRequestException(
        'Пароль обязателен и должен содержать минимум 6 символов',
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Некорректный формат email');
    }

    try {
      const existing = await this.findByEmail(email);
      if (existing) {
        throw new BadRequestException(
          'Пользователь с таким email уже существует',
        );
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = this.userRepository.create({
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: Role.USER,
        isAuthor: false,
        accessLevel: AccessLevel.BASIC,
      });

      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при создании пользователя',
      );
    }
  }

  async findAll(): Promise<Partial<User>[]> {
    try {
      return await this.userRepository.find({
        select: [
          'id',
          'email',
          'role',
          'isAuthor',
          'accessLevel',
          'createdAt',
          'updatedAt',
        ],
        order: { createdAt: 'ASC' },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Ошибка при получении списка пользователей',
      );
    }
  }

  async findById(id: string): Promise<User> {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new BadRequestException('ID пользователя не может быть пустым');
    }

    try {
      const user = await this.userRepository.findOne({
        where: { id },
        select: {
          password: false,
          refreshTokenHash: false,
        },
      });

      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при поиске пользователя');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    if (!email || typeof email !== 'string' || email.trim() === '') {
      throw new BadRequestException('Email обязателен');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Некорректный формат email');
    }

    try {
      return await this.userRepository.findOne({
        where: { email: email.toLowerCase().trim() },
        select: {
          password: false,
          refreshTokenHash: false,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Ошибка при поиске пользователя по email',
      );
    }
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    if (!email || typeof email !== 'string' || email.trim() === '') {
      throw new BadRequestException('Email обязателен');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Некорректный формат email');
    }

    try {
      return await this.userRepository.findOne({
        where: { email: email.toLowerCase().trim() },
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
    } catch (error) {
      throw new InternalServerErrorException(
        'Ошибка при поиске пользователя по email с паролем',
      );
    }
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    if (!plainPassword || !hashedPassword) {
      return false;
    }

    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Ошибка при сравнении паролей:', error);
      return false;
    }
  }

  async promoteToAdmin(userId: string): Promise<User> {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new BadRequestException('ID пользователя не может быть пустым');
    }

    const user = await this.findById(userId);

    if (user.role === Role.SUPER_ADMIN) {
      throw new BadRequestException('Нельзя изменить роль SUPER_ADMIN');
    }

    if (user.role === Role.ADMIN) {
      throw new BadRequestException('Пользователь уже является ADMIN');
    }

    user.role = Role.ADMIN;

    try {
      return await this.userRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException(
        'Ошибка при обновлении роли пользователя',
      );
    }
  }

  async revokeAdminRights(userId: string): Promise<User> {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new BadRequestException('ID пользователя не может быть пустым');
    }

    const user = await this.findById(userId);

    if (user.role !== Role.ADMIN) {
      throw new BadRequestException('Пользователь не является ADMIN');
    }

    if (user.role !== Role.ADMIN) {
      throw new BadRequestException('Пользователь не является ADMIN');
    }

    user.role = Role.USER;

    try {
      return await this.userRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException(
        'Ошибка при изменении прав администратора',
      );
    }
  }

  async makeAuthor(userId: string): Promise<User> {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new BadRequestException('ID пользователя не может быть пустым');
    }

    const user = await this.findById(userId);

    if (user.isAuthor) {
      return user;
    }

    user.isAuthor = true;

    try {
      return await this.userRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException('Ошибка при назначении авторства');
    }
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new BadRequestException('ID пользователя не может быть пустым');
    }

    const user = await this.findById(userId);

    if (user.role === Role.SUPER_ADMIN) {
      throw new BadRequestException('Нельзя удалить SUPER_ADMIN');
    }

    try {
      await this.userRepository.remove(user);
      return { message: `Пользователь ${user.email} был успешно удален` };
    } catch (error) {
      throw new InternalServerErrorException(
        'Ошибка при удалении пользователя',
      );
    }
  }

  async updateUser(userId: string, updateDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(userId);

    if (updateDto.email) {
      const existing = await this.findByEmail(updateDto.email);
      if (existing && existing.id !== userId) {
        throw new BadRequestException(
          'Email уже используется другим пользователем',
        );
      }
      user.email = updateDto.email;
    }
    if (updateDto.password) {
      user.password = await bcrypt.hash(updateDto.password, 12);
    }

    return await this.userRepository.save(user);
  }
}
