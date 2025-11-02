import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  ParseIntPipe,
  Param,
  UseGuards,
  Put,
  Delete,
} from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('Quotes')
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  // ✅ Публичные random quotes
  @ApiOperation({ summary: 'Случайные цитаты для главной страницы' })
  @Public()
  @Get('random')
  async getRandomQuotes(@Query('limit') limit?: number) {
    return this.quotesService.getRandomMapped(limit ?? 2);
  }

  // ✅ Публичные цитаты по личности
  @ApiOperation({ summary: 'Все цитаты по персоне' })
  @Public()
  @Get('by-personality/:id')
  async getByPersonality(@Param('id', ParseIntPipe) id: number) {
    return this.quotesService.findByPersonality(id);
  }

  // ✅ Публичный список всех цитат
  @ApiOperation({ summary: 'Все цитаты' })
  @Get()
  async getAll() {
    return this.quotesService.findAll();
  }

  // 🔒 Создать (ADMIN+)
  @ApiOperation({ summary: 'Создать цитату (ADMIN+)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  async create(@Body() dto: CreateQuoteDto) {
    return this.quotesService.create(dto);
  }

  // 🔒 Обновить (ADMIN+)
  @ApiOperation({ summary: 'Обновить цитату (ADMIN+)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateQuoteDto,
  ) {
    return this.quotesService.update(id, dto);
  }

  // 🔒 Удалить (ADMIN+)
  @ApiOperation({ summary: 'Удалить цитату (ADMIN+)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.quotesService.delete(id);
  }
}
