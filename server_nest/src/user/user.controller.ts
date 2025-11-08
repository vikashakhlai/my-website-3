import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserAdminListDto } from './dto/user-admin-list.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './user.entity';
import { UserService } from './user.service';

interface RequestWithUser extends Request {
  user: User;
}

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @ApiOperation({ summary: 'Создать нового пользователя (публичный доступ)' })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно создан',
    type: UserResponseDto,
  })
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createUser(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userService.create(dto.email, dto.password);
    return this.toResponseDto(user);
  }

  @ApiOperation({ summary: 'Получить список всех пользователей (ADMIN+)' })
  @ApiResponse({
    status: 200,
    description: 'Список пользователей',
    type: [UserAdminListDto],
  })
  @ApiBearerAuth('access-token')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get()
  async getAllUsers(): Promise<UserAdminListDto[]> {
    return await this.userService.findAllForAdmin();
  }

  @ApiOperation({ summary: 'Получить пользователя по ID (SELF или ADMIN+)' })
  @ApiResponse({
    status: 200,
    description: 'Информация о пользователе',
    type: UserResponseDto,
  })
  @ApiBearerAuth('access-token')
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

    return await this.userService.findById(userId);
  }

  @ApiOperation({ summary: 'Обновить данные пользователя (SELF или ADMIN+)' })
  @ApiResponse({
    status: 200,
    description: 'Данные пользователя обновлены',
    type: UserResponseDto,
  })
  @ApiBearerAuth('access-token')
  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updateUser(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() updateDto: UpdateUserDto,
    @Req() req: RequestWithUser,
  ) {
    const requester = req.user;

    if (![Role.ADMIN, Role.SUPER_ADMIN].includes(requester.role)) {
      if (requester.id !== userId) {
        throw new ForbiddenException('Можно обновлять только свой профиль');
      }
    }

    const user = await this.userService.updateUser(userId, updateDto);
    return this.toResponseDto(user);
  }

  @ApiOperation({ summary: 'Повысить пользователя до ADMIN (SUPER_ADMIN)' })
  @ApiResponse({
    status: 200,
    description: 'Пользователь повышен до ADMIN',
    type: UserResponseDto,
  })
  @ApiBearerAuth('access-token')
  @Auth(Role.SUPER_ADMIN)
  @Patch(':id/promote-to-admin')
  async promoteToAdmin(@Param('id', ParseUUIDPipe) userId: string) {
    return this.toResponseDto(await this.userService.promoteToAdmin(userId));
  }

  @ApiOperation({ summary: 'Снять права ADMIN у пользователя (SUPER_ADMIN)' })
  @ApiResponse({
    status: 200,
    description: 'Права ADMIN сняты',
    type: UserResponseDto,
  })
  @ApiBearerAuth('access-token')
  @Auth(Role.SUPER_ADMIN)
  @Patch(':id/revoke-admin')
  async revokeAdmin(@Param('id', ParseUUIDPipe) userId: string) {
    return this.toResponseDto(await this.userService.revokeAdminRights(userId));
  }

  @ApiOperation({ summary: 'Сделать пользователя автором (ADMIN+)' })
  @ApiResponse({
    status: 200,
    description: 'Пользователь стал автором',
    type: UserResponseDto,
  })
  @ApiBearerAuth('access-token')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch(':id/make-author')
  async makeAuthor(@Param('id', ParseUUIDPipe) userId: string) {
    return this.toResponseDto(await this.userService.makeAuthor(userId));
  }

  @ApiOperation({ summary: 'Удалить пользователя (SUPER_ADMIN)' })
  @ApiResponse({
    status: 200,
    description: 'Пользователь удален',
    type: Object,
  })
  @ApiBearerAuth('access-token')
  @Auth(Role.SUPER_ADMIN)
  @Delete(':id')
  async deleteUser(@Param('id', ParseUUIDPipe) userId: string) {
    return await this.userService.deleteUser(userId);
  }

  private toResponseDto(user: Partial<User>): UserResponseDto {
    const { password, ...safeUser } = user;
    return safeUser as UserResponseDto;
  }
}
