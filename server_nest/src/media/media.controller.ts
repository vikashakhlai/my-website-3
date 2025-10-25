import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { Media } from './media.entity';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /** 📜 Получить все медиа */
  @Get()
  async findAll(): Promise<Media[]> {
    return this.mediaService.findAll();
  }

  /** 🎬 Получить одно медиа по ID */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Media> {
    const media = await this.mediaService.findOne(id);
    if (!media) throw new NotFoundException(`Медиа с id=${id} не найдено`);
    return media;
  }

  /** ➕ Создать новую запись медиа */
  @Post()
  async create(@Body() data: Partial<Media>): Promise<Media> {
    return this.mediaService.create(data);
  }

  /** ♻️ Обновить существующую запись */
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<Media>,
  ): Promise<Media> {
    return this.mediaService.update(id, data);
  }

  /** 🗑 Удалить запись */
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.mediaService.remove(id);
  }

  /** 🧩 Получить упражнения, связанные с конкретным медиа */
  @Get(':id/exercises')
  async findExercises(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.findExercisesByMedia(id);
  }
}
