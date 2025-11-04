import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { MediaResponseDto } from './media.response.dto';

export class MediaWithRatingResponseDto extends MediaResponseDto {
  @ApiProperty({ example: 4.7 })
  @Expose()
  averageRating!: number;

  @ApiProperty({ example: 128 })
  @Expose()
  votes!: number;

  @ApiProperty({ example: 5, nullable: true })
  @Expose()
  userRating!: number | null;
}
