import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { Role } from 'src/auth/roles.enum';
import { mapToDto } from 'src/common/utils/map-to-dto.util';

import { CreateDialectDto } from './create-dialect.dto.ts/create-dialect.dto';
import { DialectResponseDto } from './create-dialect.dto.ts/dialect-response.dto';
import { FindAllDialectsDto } from './create-dialect.dto.ts/find-all-dialects.dto';
import { UpdateDialectDto } from './create-dialect.dto.ts/update-dialect.dto';
import { DialectsService } from './dialects.service';

@ApiTags('Dialects')
@Controller('dialects')
export class DialectsController {
  constructor(private readonly dialectsService: DialectsService) {}

  @Public()
  @ApiOperation({ summary: 'Получить все диалекты (публично)' })
  @ApiResponse({ status: 200, description: 'Список диалектов', type: Object })
  @Get()
  async findAll(@Query() query: FindAllDialectsDto) {
    const result = await this.dialectsService.findAll(query);
    return {
      ...result,
      data: result.data.map((d) => mapToDto(DialectResponseDto, d)),
    };
  }

  @Public()
  @ApiOperation({ summary: 'Получить диалект по ID (публично)' })
  @ApiParam({ name: 'id', example: 1, description: 'ID диалекта' })
  @ApiResponse({
    status: 200,
    description: 'Информация о диалекте',
    type: DialectResponseDto,
  })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const dialect = await this.dialectsService.findOne(id);
    return mapToDto(DialectResponseDto, dialect);
  }

  @ApiOperation({ summary: 'Создать диалект (SUPER_ADMIN)' })
  @ApiBearerAuth('access-token')
  @Auth(Role.SUPER_ADMIN)
  @ApiResponse({
    status: 201,
    description: 'Диалект создан',
    type: DialectResponseDto,
  })
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() dto: CreateDialectDto) {
    const dialect = await this.dialectsService.create(dto);
    return mapToDto(DialectResponseDto, dialect);
  }

  @ApiOperation({ summary: 'Обновить диалект (SUPER_ADMIN)' })
  @ApiBearerAuth('access-token')
  @Auth(Role.SUPER_ADMIN)
  @ApiParam({ name: 'id', example: 1, description: 'ID диалекта' })
  @ApiResponse({
    status: 200,
    description: 'Диалект обновлен',
    type: DialectResponseDto,
  })
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDialectDto,
  ) {
    const dialect = await this.dialectsService.update(id, dto);
    return mapToDto(DialectResponseDto, dialect);
  }

  @ApiOperation({ summary: 'Удалить диалект (SUPER_ADMIN)' })
  @ApiBearerAuth('access-token')
  @Auth(Role.SUPER_ADMIN)
  @ApiParam({ name: 'id', example: 1, description: 'ID диалекта' })
  @ApiResponse({ status: 200, description: 'Диалект удален', type: Object })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.dialectsService.remove(id);
    return { success: true };
  }
}
