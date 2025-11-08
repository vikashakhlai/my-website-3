import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubtitlesService } from './subtitles.service';
import { SubtitlesController } from './subtitles.controller';
import { Media } from 'src/media/media.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Media])],
  controllers: [SubtitlesController],
  providers: [SubtitlesService],
  exports: [SubtitlesService],
})
export class SubtitlesModule {}
