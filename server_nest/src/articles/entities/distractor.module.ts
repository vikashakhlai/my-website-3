import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Distractor } from './distractor.entity';
import { DistractorPool } from './distractor-pool.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Distractor, DistractorPool])],
  exports: [TypeOrmModule],
})
export class DistractorsModule {}
