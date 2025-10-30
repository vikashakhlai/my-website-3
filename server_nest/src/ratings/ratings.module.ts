import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rating } from './rating.entity';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';
import { User } from 'src/user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rating, User])],
  providers: [RatingsService],
  controllers: [RatingsController],
  exports: [RatingsService],
})
export class RatingsModule {}
