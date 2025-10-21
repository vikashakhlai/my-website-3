import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookRating } from './book-rating.entity';

@Injectable()
export class BookRatingsService {
  constructor(
    @InjectRepository(BookRating)
    private repo: Repository<BookRating>,
  ) {}

  async setRating(bookId: number, userId: string, rating: number) {
    const existing = await this.repo.findOne({
      where: { book_id: bookId, user_id: userId },
    });

    if (existing) {
      existing.rating = rating;
      await this.repo.save(existing);
    } else {
      const newRating = this.repo.create({
        book_id: bookId,
        user_id: userId,
        rating,
      });
      await this.repo.save(newRating);
    }

    return this.getBookStats(bookId);
  }

  async getBookStats(bookId: number) {
    const all = await this.repo.find({ where: { book_id: bookId } });
    if (all.length === 0) return { averageRating: 0, ratingCount: 0 };

    const sum = all.reduce((acc, r) => acc + r.rating, 0);
    return { averageRating: sum / all.length, ratingCount: all.length };
  }
}
