import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DictionaryService } from './dictionary.service';
import { DictionaryController } from './dictionary.controller';
import { Word } from './entities/word.entity';
import { VerbForm } from './entities/verb-form.entity';
import { UsageExample } from './entities/usage-example.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Word, VerbForm, UsageExample])],
  controllers: [DictionaryController],
  providers: [DictionaryService],
  exports: [DictionaryService],
})
export class DictionaryModule {}
