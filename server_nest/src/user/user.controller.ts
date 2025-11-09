import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  Delete,
  ForbiddenException,
  Patch,
  ParseUUIDPipe,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './user.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserAdminListDto } from './dto/user-admin-list.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { Public } from 'src/auth/decorators/public.decorator';
import { User } from './user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';

interface RequestWithUser extends Request {
  user: User;
}

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /** ✅ Публичное создание пользователя */
  @Public()
  @ApiOperation({ summary: 'Создать нового пользователя (публичный доступ)' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  @Post()
  async createUser(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userService.create(dto.email, dto.password);
    return this.toResponseDto(user);
  }

  /** 👑 Получить всех пользователей (ADMIN+) */
  @ApiOperation({ summary: 'Получить список всех пользователей (ADMIN+)' })
  @ApiBearerAuth('access-token')
  @ApiSecurity('access-token')
  @ApiResponse({ status: 200, type: [UserAdminListDto] })
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get()
  async getAllUsers(): Promise<UserAdminListDto[]> {
    return this.userService.findAll() as any;
  }

  /** 🔍 Получить одного пользователя (SELF или ADMIN+) */
  @ApiOperation({ summary: 'Получить пользователя по ID (SELF или ADMIN+)' })
  @ApiBearerAuth('access-token')
  @ApiSecurity('access-token')
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор пользователя (UUID)',
    type: String,
    format: 'uuid',
    example: 'f9c9c6b4-8d0e-4b3b-a6b3-13a8f32d78b3',
  })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @Get(':id')
  async getUserById(
    @Param('id', ParseUUIDPipe) userId: string,
    @Req() req: RequestWithUser,
  ) {
    const requester = req.user;

    if (![Role.ADMIN, Role.SUPER_ADMIN].includes(requester.role)) {
      if (requester.id !== userId) {
        throw new ForbiddenException('Можно просматривать только свой профиль');
      }
      return this.toResponseDto(await this.userService.findById(userId));
    }

    return this.userService.findById(userId);
  }

  /** ⬆️ Повысить до ADMIN (только SUPER_ADMIN) */
  @ApiOperation({ summary: 'Повысить пользователя до ADMIN (SUPER_ADMIN)' })
  @ApiBearerAuth('access-token')
  @ApiSecurity('access-token')
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор пользователя (UUID)',
    type: String,
    format: 'uuid',
    example: 'f9c9c6b4-8d0e-4b3b-a6b3-13a8f32d78b3',
  })
  @Roles(Role.SUPER_ADMIN)
  @Patch(':id/promote-to-admin')
  async promoteToAdmin(@Param('id', ParseUUIDPipe) userId: string) {
    return this.toResponseDto(await this.userService.promoteToAdmin(userId));
  }

  /** ⬇️ Снять права ADMIN (только SUPER_ADMIN) */
  @ApiOperation({ summary: 'Снять права ADMIN у пользователя (SUPER_ADMIN)' })
  @ApiBearerAuth('access-token')
  @ApiSecurity('access-token')
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор пользователя (UUID)',
    type: String,
    format: 'uuid',
    example: 'f9c9c6b4-8d0e-4b3b-a6b3-13a8f32d78b3',
  })
  @Roles(Role.SUPER_ADMIN)
  @Patch(':id/revoke-admin')
  async revokeAdmin(@Param('id', ParseUUIDPipe) userId: string) {
    return this.toResponseDto(await this.userService.revokeAdminRights(userId));
  }

  /** ✍️ Сделать автора (ADMIN+) */
  @ApiOperation({ summary: 'Назначить пользователя автором (ADMIN+)' })
  @ApiBearerAuth('access-token')
  @ApiSecurity('access-token')
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор пользователя (UUID)',
    type: String,
    format: 'uuid',
    example: 'f9c9c6b4-8d0e-4b3b-a6b3-13a8f32d78b3',
  })
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch(':id/make-author')
  async makeAuthor(@Param('id', ParseUUIDPipe) userId: string) {
    return this.toResponseDto(await this.userService.makeAuthor(userId));
  }

  /** ❌ Удалить пользователя (SUPER_ADMIN) */
  @ApiOperation({ summary: 'Удалить пользователя (SUPER_ADMIN)' })
  @ApiBearerAuth('access-token')
  @ApiSecurity('access-token')
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор пользователя (UUID)',
    type: String,
    format: 'uuid',
    example: 'f9c9c6b4-8d0e-4b3b-a6b3-13a8f32d78b3',
  })
  @Roles(Role.SUPER_ADMIN)
  @Delete(':id')
  async deleteUser(@Param('id', ParseUUIDPipe) userId: string) {
    return this.userService.deleteUser(userId);
  }

  @ApiOperation({ summary: 'Изменить пароль текущего пользователя' })
  @ApiBearerAuth('access-token')
  @ApiSecurity('access-token')
  @ApiResponse({ status: 200, description: 'Пароль успешно обновлён' })
  @Patch('change-password')
  @HttpCode(200)
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @Req() req: RequestWithUser,
  ) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Пароли не совпадают');
    }
    await this.userService.changePassword(req.user.id, dto);
    return { message: 'Password updated successfully' };
  }

  /** 🧩 DTO Mapper (скрывает пароль) */
  private toResponseDto(user: Partial<User>): UserResponseDto {
    const { password, ...safeUser } = user;
    return safeUser as UserResponseDto;
  }
}
