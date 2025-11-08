import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTextbookDto {
  @ApiProperty({
    example: 'Advanced TypeScript',
    description: 'Название учебника',
  })
  @IsString({ message: 'Название должно быть строкой' })
  @MaxLength(255, { message: 'Название не может быть длиннее 255 символов' })
  title!: string;

  @ApiPropertyOptional({
    example: 'John Doe, Jane Smith',
    description: 'Авторы учебника',
  })
  @IsOptional()
  @IsString({ message: 'Авторы должны быть строкой' })
  @MaxLength(1000, {
    message: 'Поле авторов не может быть длиннее 1000 символов',
  })
  authors?: string;

  @ApiPropertyOptional({
    example: 'Учебник по TypeScript для продвинутых разработчиков',
    description: 'Описание учебника',
  })
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  @MaxLength(5000, { message: 'Описание не может быть длиннее 5000 символов' })
  description?: string;

  @ApiPropertyOptional({
    example: 'Advanced',
    description: 'Уровень сложности (Basic, Intermediate, Advanced)',
  })
  @IsOptional()
  @IsString({ message: 'Уровень должен быть строкой' })
  @IsIn(['Basic', 'Intermediate', 'Advanced'], {
    message: 'Уровень должен быть одним из: Basic, Intermediate, Advanced',
  })
  @MaxLength(50, { message: 'Уровень не может быть длиннее 50 символов' })
  level?: string;

  @ApiPropertyOptional({ example: 2023, description: 'Год публикации' })
  @IsOptional()
  @IsNumber({}, { message: 'Год публикации должен быть числом' })
  @Min(1000, { message: 'Год публикации должен быть не менее 1000' })
  @Max(2100, { message: 'Год публикации должен быть не более 2100' })
  publication_year?: number;

  @ApiPropertyOptional({
    example: 'https://example.com/book.pdf',
    description: 'Ссылка на PDF',
  })
  @IsOptional()
  @IsUrl({}, { message: 'PDF URL должен быть корректным URL' })
  @MaxLength(1000, {
    message: 'Ссылка на PDF не может быть длиннее 1000 символов',
  })
  pdf_url?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/cover.jpg',
    description: 'Ссылка на обложку',
  })
  @IsOptional()
  @IsUrl({}, { message: 'URL обложки должен быть корректным URL' })
  @MaxLength(1000, {
    message: 'Ссылка на обложку не может быть длиннее 1000 символов',
  })
  cover_image_url?: string;
}
