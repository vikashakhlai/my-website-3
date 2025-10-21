import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise } from './exercise.entity';
import { ExerciseItem } from './exercise-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Exercise, ExerciseItem])],
  exports: [TypeOrmModule],
})
export class ExercisesModule {}
