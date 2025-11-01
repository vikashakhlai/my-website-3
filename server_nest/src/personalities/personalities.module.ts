import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Personality } from './personality.entity';
import { PersonalitiesService } from './personalities.service';
import { PersonalitiesController } from './personalities.controller';
import { CommentsModule } from 'src/comments/comments.module';
import { Comment } from 'src/comments/comment.entity';
import { RatingsModule } from 'src/ratings/ratings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Personality, Comment]),
    CommentsModule,
    RatingsModule,
  ],
  controllers: [PersonalitiesController],
  providers: [PersonalitiesService],
  exports: [PersonalitiesService],
})
export class PersonalitiesModule {}
