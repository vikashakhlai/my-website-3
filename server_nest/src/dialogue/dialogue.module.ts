import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from 'src/media/media.entity';
import { DialogueController } from './dialogue.controller';
import { DialogueService } from './dialogue.service';
import { DialogueGroup } from './dialogue_group.entity';
import { DialogueScript } from './dialogue_script.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DialogueGroup, DialogueScript, Media])],
  providers: [DialogueService],
  controllers: [DialogueController],
  exports: [DialogueService],
})
export class DialogueModule {}
