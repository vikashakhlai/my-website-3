import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Textbook } from './textbook.entity';
import { TextbooksService } from './textbooks.service';
import { TextbooksController } from './textbooks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Textbook])],
  controllers: [TextbooksController],
  providers: [TextbooksService],
  exports: [TextbooksService],
})
export class TextbooksModule {}
