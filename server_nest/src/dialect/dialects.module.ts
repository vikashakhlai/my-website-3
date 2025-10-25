import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dialect } from './dialect.entity';
import { DialectsService } from './dialects.service';
import { DialectsController } from './dialects.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Dialect])],
  controllers: [DialectsController],
  providers: [DialectsService],
  exports: [DialectsService],
})
export class DialectsModule {}
