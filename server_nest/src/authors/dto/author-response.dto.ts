import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AuthorBookDto {
  @ApiProperty({ example: 1, description: 'ID книги' })
  @Expose()
  id!: number;

  @ApiProperty({ example: 'Канон врачебной науки', description: 'Название' })
  @Expose()
  title!: string;

  @ApiProperty({
    example: '/uploads/books/canon.jpg',
    nullable: true,
    description: 'Обложка',
  })
  @Expose()
  cover_url!: string | null;

  @ApiProperty({ example: 1025, nullable: true, description: 'Год публикации' })
  @Expose()
  publication_year!: number | null;
}

export class AuthorResponseDto {
  @ApiProperty({ example: 1, description: 'ID автора' })
  @Expose()
  id!: number;

  @ApiProperty({ example: 'Ибн Сина', description: 'Полное имя' })
  @Expose()
  full_name!: string;

  @ApiProperty({
    example: 'Персидский философ и врач...',
    nullable: true,
    description: 'Биография',
  })
  @Expose()
  bio!: string | null;

  @ApiProperty({
    example: '/uploads/authors/ibn_sina.jpg',
    nullable: true,
    description: 'Фото',
  })
  @Expose()
  photo_url!: string | null;

  @ApiProperty({ type: [AuthorBookDto], description: 'Книги автора' })
  @Expose()
  books!: AuthorBookDto[];
}
