import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';

export class CreateArticleCommentDto {
  @ApiProperty({ example: 'Очень интересно, спасибо!' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional({
    example: 12,
    description: 'ID родительского комментария',
  })
  @IsOptional()
  @IsInt()
  parentId?: number;
}
