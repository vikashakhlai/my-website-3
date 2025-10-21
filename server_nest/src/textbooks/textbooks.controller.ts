import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { TextbooksService } from './textbooks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('textbooks')
export class TextbooksController {
  constructor(private readonly textbooksService: TextbooksService) {}

  @Get()
  getAll() {
    return this.textbooksService.getAll();
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.textbooksService.getById(id);
  }

  @Get('random/one')
  getRandom() {
    return this.textbooksService.getRandom();
  }

  // ✅ Только ADMIN и SUPER_ADMIN могут добавлять
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post()
  create(@Body() dto: any) {
    return this.textbooksService.create(dto);
  }

  // ✅ Только ADMIN и SUPER_ADMIN могут обновлять
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.textbooksService.update(id, dto);
  }

  // ✅ Только ADMIN и SUPER_ADMIN могут удалять
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.textbooksService.remove(id);
  }
}
