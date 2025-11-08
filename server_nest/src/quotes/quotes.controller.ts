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
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { QuotesService } from './quotes.service';

@ApiTags('Quotes')
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @ApiOperation({ summary: 'Случайные цитаты для главной страницы' })
  @Public()
  @ApiResponse({ status: 200, description: 'Случайные цитаты', type: [Object] })
  @Get('random')
  async getRandomQuotes(@Query('limit') limit?: number) {
    return this.quotesService.getRandomMapped(limit ?? 2);
  }

  @ApiOperation({ summary: 'Все цитаты по персоне' })
  @Public()
  @ApiParam({ name: 'id', example: 1, description: 'ID личности' })
  @ApiResponse({
    status: 200,
    description: 'Цитаты по личности',
    type: [Object],
  })
  @Get('by-personality/:id')
  async getByPersonality(@Param('id', ParseIntPipe) id: number) {
    return this.quotesService.findByPersonality(id);
  }

  @ApiOperation({ summary: 'Все цитаты' })
  @ApiResponse({
    status: 200,
    description: 'Список всех цитат',
    type: [Object],
  })
  @Get()
  async getAll() {
    return this.quotesService.findAll();
  }

  @ApiOperation({ summary: 'Создать цитату (ADMIN+)' })
  @ApiBearerAuth('access-token')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiResponse({ status: 201, description: 'Цитата создана', type: Object })
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() dto: CreateQuoteDto) {
    return this.quotesService.create(dto);
  }

  @ApiOperation({ summary: 'Обновить цитату (ADMIN+)' })
  @ApiBearerAuth('access-token')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiParam({ name: 'id', example: 1, description: 'ID цитаты' })
  @ApiResponse({ status: 200, description: 'Цитата обновлена', type: Object })
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateQuoteDto,
  ) {
    return this.quotesService.update(id, dto);
  }

  @ApiOperation({ summary: 'Удалить цитату (ADMIN+)' })
  @ApiBearerAuth('access-token')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiParam({ name: 'id', example: 1, description: 'ID цитаты' })
  @ApiResponse({ status: 200, description: 'Цитата удалена', type: Object })
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.quotesService.delete(id);
  }
}
