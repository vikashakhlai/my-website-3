import { IsNotEmpty, IsOptional, IsInt, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  target_type!: 'book' | 'article' | 'media' | 'personality' | 'textbook';

  @IsInt()
  target_id!: number;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsOptional()
  parent_id?: number;
}
