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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UserService } from './user.service';
import { User } from './user.entity';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

interface RequestWithUser extends Request {
  user: User;
}

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ------------------------------
  // 🔹 Создание пользователя
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
      const user = await this.userService.create(
        dto.email,
        dto.password,
        dto.role,
        dto.isAuthor,
      );

      return this.toResponseDto(user);
    } catch (err) {
      handleControllerError(err, 'Ошибка при создании пользователя');
    }
  }

  // ------------------------------
  // 🔹 Получение всех пользователей
  // ------------------------------
  @ApiOperation({ summary: 'Получить список всех пользователей' })
  @ApiResponse({
    status: 200,
    description: 'Список пользователей',
    type: [UserResponseDto],
  })
  @Get()
  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.userService.findAll();
    return users.map((user) => this.toResponseDto(user));
  }

  // ------------------------------
  // 🔹 Повышение до администратора
  // ------------------------------
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Повысить пользователя до ADMIN (только SUPER_ADMIN)',
  })
  @ApiResponse({
    status: 200,
    description: 'Пользователь повышен до ADMIN',
    type: UserResponseDto,
  })
  @UseGuards(AuthGuard('jwt'))
  @Post(':id/promote-to-admin')
  async promoteToAdmin(
    @Param('id') userId: string,
    @Req() req: RequestWithUser,
  ): Promise<UserResponseDto> {
    try {
      const updated = await this.userService.promoteToAdmin(
        userId,
        req.user.role,
      );
      return this.toResponseDto(updated);
    } catch (err) {
      handleControllerError(err, 'Ошибка при повышении пользователя');
    }
  }

  // ------------------------------
  // 🔹 Отзыв прав администратора
  // ------------------------------
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Отозвать права ADMIN (только SUPER_ADMIN)' })
  @ApiResponse({
    status: 200,
    description: 'Права ADMIN успешно отозваны',
    type: UserResponseDto,
  })
  @UseGuards(AuthGuard('jwt'))
  @Post(':id/revoke-admin')
  async revokeAdmin(
    @Param('id') userId: string,
    @Req() req: RequestWithUser,
  ): Promise<UserResponseDto> {
    try {
      const updated = await this.userService.revokeAdminRights(
        userId,
        req.user.role,
      );
      return this.toResponseDto(updated);
    } catch (err) {
      handleControllerError(err, 'Ошибка при отзыве прав администратора');
    }
  }

  // ------------------------------
  // 🔹 Назначение автора
  // ------------------------------
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Назначить пользователя автором (ADMIN или SUPER_ADMIN)',
  })
  @ApiResponse({
    status: 200,
    description: 'Пользователь стал автором',
    type: UserResponseDto,
  })
  @UseGuards(AuthGuard('jwt'))
  @Post(':id/make-author')
  async makeAuthor(
    @Param('id') userId: string,
    @Req() req: RequestWithUser,
  ): Promise<UserResponseDto> {
    try {
      const updated = await this.userService.makeAuthor(userId, req.user.role);
      return this.toResponseDto(updated);
    } catch (err) {
      handleControllerError(err, 'Ошибка при назначении автора');
    }
  }

  // ------------------------------
  // 🔹 Удаление пользователя
  // ------------------------------
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить пользователя (только SUPER_ADMIN)' })
  @ApiResponse({ status: 200, description: 'Пользователь успешно удалён' })
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteUser(@Param('id') userId: string, @Req() req: RequestWithUser) {
    try {
      return await this.userService.deleteUser(userId, req.user.role);
    } catch (err) {
      handleControllerError(err, 'Ошибка при удалении пользователя');
    }
  }

  // ------------------------------
  // 🧩 Преобразование сущности в DTO
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
