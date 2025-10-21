import { Controller, Get, Query, Param } from '@nestjs/common';
import { VideosService } from './videos.service';

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  /** 🎬 Все видео (опционально по диалекту) */
  @Get()
  async getVideos(@Query('dialect') dialectSlug?: string) {
    return this.videosService.getVideos(dialectSlug);
  }

  /** 🔍 Одно видео */
  @Get(':id')
  async getById(@Param('id') id: number) {
    return this.videosService.getById(id);
  }
}
