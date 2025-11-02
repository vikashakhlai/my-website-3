import { ApiProperty } from '@nestjs/swagger';
import { Era } from '../personality.entity';

export class QuoteDto {
  @ApiProperty() id!: number;
  @ApiProperty() text_ar!: string;
  @ApiProperty() text_ru!: string;
}

export class BookRefDto {
  @ApiProperty() id!: number;
  @ApiProperty() title!: string;
  @ApiProperty() description!: string;
  @ApiProperty() publication_year!: number;
  @ApiProperty() cover_url!: string | null;
}

export class ArticleRefDto {
  @ApiProperty() id!: number;
  @ApiProperty() title!: string;
  @ApiProperty() created_at!: string;
}

export class PersonalityResponseDto {
  @ApiProperty() id!: number;
  @ApiProperty() name!: string;
  @ApiProperty() years!: string;
  @ApiProperty() position!: string;
  @ApiProperty() biography!: string;

  @ApiProperty({ type: [String] })
  facts!: string[];

  @ApiProperty({ enum: Era })
  era!: Era;

  @ApiProperty({
    example: '/uploads/personalities_photoes/default.webp',
  })
  imageUrl!: string;

  @ApiProperty({ type: [BookRefDto] })
  books!: BookRefDto[];

  @ApiProperty({ type: [ArticleRefDto] })
  articles!: ArticleRefDto[];

  @ApiProperty({ type: [QuoteDto] })
  quotes!: QuoteDto[];

  @ApiProperty({ example: 4.8 })
  averageRating!: number | null;

  @ApiProperty({ example: 122 })
  ratingCount!: number;

  @ApiProperty({ example: 5 })
  userRating!: number | null;

  @ApiProperty({ example: 18 })
  commentsCount!: number;
}
