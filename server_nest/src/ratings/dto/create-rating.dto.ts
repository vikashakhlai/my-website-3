import { IsNotEmpty, IsInt, Min, Max, IsString } from 'class-validator';

export class CreateRatingDto {
  @IsString()
  @IsNotEmpty()
  target_type!: 'book' | 'article' | 'media' | 'personality' | 'textbook';

  @IsInt()
  target_id!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  value!: number;
}
