import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { MediaResponseDto } from './media.response.dto';

export class MediaWithRatingResponseDto extends MediaResponseDto {
  @ApiProperty({ example: 4.7, description: 'Средний рейтинг' })
  @Expose()
  averageRating!: number;

  @ApiProperty({ example: 128, description: 'Количество голосов' })
  @Expose()
  votes!: number;

  @ApiProperty({
    example: 5,
    nullable: true,
    description: 'Оценка пользователя',
  })
  @Expose()
  userRating!: number | null;
}
