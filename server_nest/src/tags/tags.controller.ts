import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { Role } from 'src/auth/roles.enum';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagsService } from './tags.service';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Public()
  @ApiOperation({ summary: 'Получить все теги (публично)' })
  @ApiResponse({ status: 200, description: 'Список тегов', type: [Object] })
  @Get()
  async getAll() {
    return this.tagsService.findAll();
  }

  @ApiBearerAuth('access-token')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Создать тег (ADMIN+)' })
  @ApiResponse({ status: 201, description: 'Тег создан', type: Object })
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() dto: CreateTagDto) {
    return this.tagsService.create(dto);
  }

  @ApiBearerAuth('access-token')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Обновить тег (ADMIN+)' })
  @ApiResponse({ status: 200, description: 'Тег обновлен', type: Object })
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTagDto,
  ) {
    return this.tagsService.update(id, dto);
  }

  @ApiBearerAuth('access-token')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Удалить тег (ADMIN+)' })
  @ApiResponse({ status: 200, description: 'Тег удален', type: Object })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.tagsService.remove(id);
  }
}
