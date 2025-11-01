import {
  Controller,
  Get,
  Post,
  Body,
  BadRequestException,
  Param,
  UseGuards,
  Req,
  Delete,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './user.service';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserAdminListDto } from './dto/user-admin-list.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { User } from './user.entity';

interface RequestWithUser extends Request {
  user: User;
}

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ------------------------------
  // 🔹 Создание пользователя (публичное)
  // ------------------------------
  @ApiOperation({ summary: 'Создать нового пользователя (публичный доступ)' })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно создан',
    type: UserResponseDto,
  })
  @Post()
  async createUser(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const user = await this.userService.create(dto.email, dto.password);
      return this.toResponseDto(user);
    } catch (err) {
      handleControllerError(err, 'Ошибка при создании пользователя');
    }
  }

  // ------------------------------
  // 🔹 Получение всех пользователей (ADMIN+)
  // ------------------------------
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Получить список всех пользователей (ADMIN+)' })
  @ApiResponse({
    status: 200,
    type: [UserAdminListDto],
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get()
  async getAllUsers(): Promise<UserAdminListDto[]> {
    const users = await this.userService.findAll();
    return users as UserAdminListDto[];
  }

  // ------------------------------
  // 🔹 Получение одного пользователя (SELF или ADMIN+)
  // ------------------------------
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Получить пользователя по ID (SELF или ADMIN+)' })
  @ApiResponse({
    status: 200,
    type: UserResponseDto,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  async getUserById(
    @Param('id') userId: string,
    @Req() req: RequestWithUser,
  ): Promise<UserResponseDto | UserAdminListDto> {
    const requester = req.user;

    // ✅ USER / TUTOR → только свой профиль
    if (![Role.ADMIN, Role.SUPER_ADMIN].includes(requester.role)) {
      if (requester.id !== userId) {
        throw new ForbiddenException('Можно просматривать только свой профиль');
      }
      const user = await this.userService.findById(userId);
      return this.toResponseDto(user);
    }

    // ✅ ADMIN+ → полный доступ
    const user = await this.userService.findById(userId);
    return user as UserAdminListDto;
  }

  // ------------------------------
  // 🔹 Повышение до администратора
  // ------------------------------
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Повысить пользователя до ADMIN (только SUPER_ADMIN)',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Post(':id/promote-to-admin')
  async promoteToAdmin(@Param('id') userId: string): Promise<UserResponseDto> {
    try {
      const updated = await this.userService.promoteToAdmin(userId);
      return this.toResponseDto(updated);
    } catch (err) {
      handleControllerError(err, 'Ошибка при повышении пользователя');
    }
  }

  // ------------------------------
  // 🔹 Отзыв прав администратора
  // ------------------------------
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Отозвать права ADMIN (только SUPER_ADMIN)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Post(':id/revoke-admin')
  async revokeAdmin(@Param('id') userId: string): Promise<UserResponseDto> {
    try {
      const updated = await this.userService.revokeAdminRights(userId);
      return this.toResponseDto(updated);
    } catch (err) {
      handleControllerError(err, 'Ошибка при отзыве прав администратора');
    }
  }

  // ------------------------------
  // 🔹 Назначение автора
  // ------------------------------
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Назначить пользователя автором (ADMIN или SUPER_ADMIN)',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post(':id/make-author')
  async makeAuthor(@Param('id') userId: string): Promise<UserResponseDto> {
    try {
      const updated = await this.userService.makeAuthor(userId);
      return this.toResponseDto(updated);
    } catch (err) {
      handleControllerError(err, 'Ошибка при назначении автора');
    }
  }

  // ------------------------------
  // 🔹 Удаление пользователя
  // ------------------------------
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Удалить пользователя (только SUPER_ADMIN)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Delete(':id')
  async deleteUser(@Param('id') userId: string) {
    try {
      return await this.userService.deleteUser(userId);
    } catch (err) {
      handleControllerError(err, 'Ошибка при удалении пользователя');
    }
  }

  // ------------------------------
  // 🧩 Преобразование сущности в DTO (обрезает пароль)
  // ------------------------------
  private toResponseDto(user: Partial<User>): UserResponseDto {
    const { password, ...safeUser } = user;
    return safeUser as UserResponseDto;
  }
}

/**
 * ✅ Универсальный обработчик ошибок
 */
function handleControllerError(err: unknown, defaultMessage: string): never {
  if (err instanceof Error && err.message) {
    throw new BadRequestException(err.message);
  }
  throw new BadRequestException(defaultMessage);
}
