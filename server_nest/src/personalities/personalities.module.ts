import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Personality } from './personality.entity';
import { PersonalitiesService } from './personalities.service';
import { PersonalitiesController } from './personalities.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Personality])],
  controllers: [PersonalitiesController],
  providers: [PersonalitiesService],
  exports: [PersonalitiesService],
})
export class PersonalitiesModule {}
