import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DialectTopic } from './dialect_topics.entity';
import { DialectTopicsService } from './dialect_topics.service';
import { DialectTopicsController } from './dialect_topics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DialectTopic])],
  controllers: [DialectTopicsController],
  providers: [DialectTopicsService],
  exports: [DialectTopicsService],
})
export class DialectTopicsModule {}
