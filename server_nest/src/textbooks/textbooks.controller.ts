import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  Request,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { interval, Observable, switchMap } from 'rxjs';

import { TextbooksService } from './textbooks.service';
import { RatingsService } from 'src/ratings/ratings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateTextbookDto } from './dto/create-textbook.dto';
import { UpdateTextbookDto } from './dto/update-textbook.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from 'src/auth/roles.enum';
import { TargetType } from 'src/common/enums/target-type.enum';

@ApiTags('Textbooks')
@Controller('textbooks')
export class TextbooksController {
  constructor(
    private readonly textbooksService: TextbooksService,
    private readonly ratingsService: RatingsService,
  ) {}

  @ApiOperation({ summary: 'Список учебников (публично)' })
  @Get()
  async getAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('sort') sort?: 'asc' | 'desc',
    @Query('level') level?: string,
  ) {
    return this.textbooksService.getAll({ page, limit, sort, level });
  }

  @ApiOperation({ summary: 'Получить учебник (требует авторизацию)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user?.sub;
    return this.textbooksService.getById(id, userId);
  }

  @ApiOperation({ summary: 'Случайный учебник (публично)' })
  @Get('random/one')
  getRandom() {
    return this.textbooksService.getRandom();
  }

  @ApiOperation({ summary: 'Создать новый учебник (только SUPER_ADMIN)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Post()
  create(@Body() dto: CreateTextbookDto) {
    return this.textbooksService.create(dto);
  }

  @ApiOperation({ summary: 'Обновить учебник (только SUPER_ADMIN)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTextbookDto,
  ) {
    return this.textbooksService.update(id, dto);
  }

  @ApiOperation({ summary: 'Удалить учебник (только SUPER_ADMIN)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.textbooksService.remove(id);
  }

  /** 📡 SSE Live рейтинг учебника */
  @ApiOperation({ summary: 'Live-поток рейтинга (публично, SSE)' })
  @Sse('stream/:id/rating')
  streamRatings(
    @Param('id', ParseIntPipe) id: number,
  ): Observable<MessageEvent> {
    return interval(5000).pipe(
      switchMap(async () => {
        const { average, votes } = await this.ratingsService.getAverage(
          TargetType.TEXTBOOK,
          id,
        );
        return { data: { average, votes } };
      }),
    );
  }
}
