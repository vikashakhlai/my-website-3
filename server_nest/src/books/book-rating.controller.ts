import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { BookRatingsService } from './book-rating.service';

@Controller('books/:bookId/ratings')
export class BookRatingsController {
  constructor(private readonly ratingsService: BookRatingsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async rateBook(
    @Param('bookId') bookId: number,
    @Body('rating') rating: number,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    return this.ratingsService.setRating(bookId, userId, rating);
  }

  @Get()
  async getBookRating(@Param('bookId') bookId: number) {
    return this.ratingsService.getBookStats(bookId);
  }
}
