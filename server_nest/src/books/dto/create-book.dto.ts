import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBookDto {
  @ApiProperty({
    example: 'История ислама',
    description: 'Название книги',
  })
  @IsString({ message: 'title должно быть строкой' })
  @IsNotEmpty({ message: 'title не может быть пустым' })
  @MaxLength(500, { message: 'title не может быть длиннее 500 символов' })
  title!: string;

  @ApiPropertyOptional({
    example: 'Исчерпывающее исследование истории ислама',
    description: 'Описание книги',
  })
  @IsOptional()
  @IsString({ message: 'description должно быть строкой' })
  @MaxLength(10000, {
    message: 'description не может быть длиннее 10000 символов',
  })
  description?: string;

  @ApiPropertyOptional({
    example: 2023,
    description: 'Год публикации',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'publication_year должно быть целым числом' })
  @Min(1000, { message: 'publication_year не может быть меньше 1000' })
  @Max(2100, { message: 'publication_year не может быть больше 2100' })
  publication_year?: number;

  @ApiPropertyOptional({
    example: '/uploads/books/cover.jpg',
    description: 'Ссылка на обложку',
  })
  @IsOptional()
  @IsString({ message: 'cover_url должно быть строкой' })
  @MaxLength(500, { message: 'cover_url не может быть длиннее 500 символов' })
  cover_url?: string;

  @ApiPropertyOptional({
    example: 450,
    description: 'Количество страниц',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'pages должно быть целым числом' })
  @Min(1, { message: 'pages должно быть не меньше 1' })
  @Max(10000, { message: 'pages не может быть больше 10000' })
  pages?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID издательства',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'publisher_id должно быть целым числом' })
  publisher_id?: number;

  @ApiPropertyOptional({
    example: [1, 2],
    description: 'Массив ID авторов',
  })
  @IsOptional()
  @IsArray({ message: 'authorIds должно быть массивом' })
  @ArrayNotEmpty({ message: 'authorIds не может быть пустым' })
  @ArrayUnique({ message: 'authorIds должны быть уникальными' })
  @Type(() => Number)
  @IsInt({
    each: true,
    message: 'Каждый элемент authorIds должен быть целым числом',
  })
  authorIds?: number[];

  @ApiPropertyOptional({
    example: [1, 3],
    description: 'Массив ID тегов',
  })
  @IsOptional()
  @IsArray({ message: 'tagIds должно быть массивом' })
  @ArrayUnique({ message: 'tagIds должны быть уникальными' })
  @Type(() => Number)
  @IsInt({
    each: true,
    message: 'Каждый элемент tagIds должен быть целым числом',
  })
  tagIds?: number[];
}
